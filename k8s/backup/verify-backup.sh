#!/bin/bash

# Nastavení proměnných
BACKUP_DIR="/backup"
VERIFY_DIR="/verify"
LATEST_BACKUP=$(aws s3 ls s3://$S3_BUCKET/backups/ | sort | tail -n 1 | awk '{print $4}')
TEMP_DB="verify_$(date +%Y%m%d_%H%M%S)"

# Stažení nejnovější zálohy
aws s3 cp "s3://$S3_BUCKET/backups/$LATEST_BACKUP" "$BACKUP_DIR/"

# Vytvoření dočasné databáze pro verifikaci
PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d postgres -c "CREATE DATABASE $TEMP_DB;"

# Obnovení zálohy do dočasné databáze
PGPASSWORD=$POSTGRES_PASSWORD pg_restore -h $POSTGRES_HOST -U $POSTGRES_USER -d $TEMP_DB "$BACKUP_DIR/$LATEST_BACKUP"

# Verifikace dat
VERIFICATION_RESULT=$(PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $TEMP_DB -c "
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'SUCCESS'
        ELSE 'FAILURE'
    END as verification_status,
    COUNT(*) as record_count
FROM information_schema.tables
WHERE table_schema = 'public';
")

# Odeslání výsledku verifikace
if [[ $VERIFICATION_RESULT == *"SUCCESS"* ]]; then
    echo "Backup verification successful"
    # Odeslání notifikace o úspěchu
    aws sns publish \
        --topic-arn "arn:aws:sns:eu-central-1:123456789012:backup-notifications" \
        --message "Backup verification successful for $LATEST_BACKUP"
else
    echo "Backup verification failed"
    # Odeslání notifikace o selhání
    aws sns publish \
        --topic-arn "arn:aws:sns:eu-central-1:123456789012:backup-notifications" \
        --message "Backup verification failed for $LATEST_BACKUP"
    exit 1
fi

# Vyčištění
PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d postgres -c "DROP DATABASE $TEMP_DB;"
rm -f "$BACKUP_DIR/$LATEST_BACKUP" 