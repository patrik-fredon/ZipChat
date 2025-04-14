#!/bin/bash

# Nastavení proměnných
BACKUP_DIR="/backup"
VERIFY_DIR="/verify"
LATEST_BACKUP=$(aws s3 ls s3://$S3_BUCKET/backups/ | sort | tail -n 1 | awk '{print $4}')
TEMP_DB="verify_$(date +%Y%m%d_%H%M%S)"
LOG_FILE="/var/log/backup-verify.log"

# Funkce pro logování
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

# Funkce pro odeslání notifikace
send_notification() {
    local subject=$1
    local message=$2
    aws sns publish \
        --topic-arn $SNS_TOPIC_ARN \
        --subject "$subject" \
        --message "$message"
}

# Kontrola existence zálohy
if [ -z "$LATEST_BACKUP" ]; then
    log "No backup found in S3 bucket"
    send_notification "Backup Verification Failed" "No backup found in S3 bucket"
    exit 1
fi

log "Starting verification of backup: $LATEST_BACKUP"

# Stažení nejnovější zálohy
if ! aws s3 cp "s3://$S3_BUCKET/backups/$LATEST_BACKUP" "$BACKUP_DIR/"; then
    log "Failed to download backup from S3"
    send_notification "Backup Verification Failed" "Failed to download backup from S3"
    exit 1
fi

# Vytvoření dočasné databáze pro verifikaci
if ! PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d postgres -c "CREATE DATABASE $TEMP_DB;"; then
    log "Failed to create temporary database"
    send_notification "Backup Verification Failed" "Failed to create temporary database"
    exit 1
fi

# Obnovení zálohy do dočasné databáze
if ! PGPASSWORD=$POSTGRES_PASSWORD pg_restore -h $POSTGRES_HOST -U $POSTGRES_USER -d $TEMP_DB "$BACKUP_DIR/$LATEST_BACKUP"; then
    log "Failed to restore backup to temporary database"
    send_notification "Backup Verification Failed" "Failed to restore backup to temporary database"
    PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d postgres -c "DROP DATABASE $TEMP_DB;"
    exit 1
fi

# Verifikace dat
VERIFICATION_RESULT=$(PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $TEMP_DB -c "
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'SUCCESS'
        ELSE 'FAILURE'
    END as verification_status,
    COUNT(*) as record_count,
    string_agg(table_name, ', ') as tables
FROM information_schema.tables
WHERE table_schema = 'public';
")

# Kontrola integrity dat
INTEGRITY_CHECK=$(PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $TEMP_DB -c "
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'SUCCESS'
        ELSE 'FAILURE'
    END as integrity_status,
    COUNT(*) as error_count,
    string_agg(table_name, ', ') as tables_with_errors
FROM (
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name NOT IN (
        SELECT table_name
        FROM information_schema.table_constraints
        WHERE constraint_type = 'PRIMARY KEY'
    )
) t;
")

# Odeslání výsledku verifikace
if [[ $VERIFICATION_RESULT == *"SUCCESS"* && $INTEGRITY_CHECK == *"SUCCESS"* ]]; then
    log "Backup verification successful"
    log "Tables found: $(echo $VERIFICATION_RESULT | grep -o 'tables: .*' | cut -d'|' -f3)"
    send_notification "Backup Verification Successful" "Backup verification successful for $LATEST_BACKUP\nTables verified: $(echo $VERIFICATION_RESULT | grep -o 'tables: .*' | cut -d'|' -f3)"
else
    log "Backup verification failed"
    log "Verification result: $VERIFICATION_RESULT"
    log "Integrity check: $INTEGRITY_CHECK"
    send_notification "Backup Verification Failed" "Backup verification failed for $LATEST_BACKUP\nVerification result: $VERIFICATION_RESULT\nIntegrity check: $INTEGRITY_CHECK"
    PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d postgres -c "DROP DATABASE $TEMP_DB;"
    exit 1
fi

# Vyčištění
PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d postgres -c "DROP DATABASE $TEMP_DB;"
rm -f "$BACKUP_DIR/$LATEST_BACKUP"

log "Backup verification completed successfully" 