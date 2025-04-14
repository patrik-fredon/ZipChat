# Disaster Recovery Plan

## 1. Úvod

Tento dokument popisuje postup obnovy systému ZipChat v případě havárie. Plán zahrnuje postupy pro různé scénáře selhání a jejich řešení.

## 2. Scénáře selhání

### 2.1. Selhání databáze

#### Příznaky

- Chyby při připojení k databázi
- Pomalé odezvy systému
- Chybějící nebo poškozená data

#### Postup obnovy

1. Identifikace poslední úspěšné zálohy
2. Obnovení databáze z zálohy:
   ```bash
   PGPASSWORD=$POSTGRES_PASSWORD pg_restore -h $NEW_DB_HOST -U $POSTGRES_USER -d $POSTGRES_DB /backup/latest.dump
   ```
3. Verifikace obnovených dat
4. Přepnutí aplikace na novou databázi

### 2.2. Selhání Kubernetes clusteru

#### Příznaky

- Nedostupnost všech služeb
- Chyby při komunikaci s API serverem
- Selhání nodeů

#### Postup obnovy

1. Vytvoření nového Kubernetes clusteru
2. Obnovení konfigurace:
   ```bash
   kubectl apply -f k8s/
   ```
3. Obnovení persistentních dat
4. Restart služeb

### 2.3. Selhání storage

#### Příznaky

- Chyby při čtení/zápisu do storage
- Ztráta dat
- Pomalé odezvy

#### Postup obnovy

1. Přepnutí na záložní storage
2. Obnovení dat z záloh
3. Verifikace integrity dat
4. Přepnutí aplikace na nové storage

## 3. Zálohovací strategie

### 3.1. Databáze

- Denní zálohy do S3
- Retence: 30 dní
- Verifikace záloh
- Šifrování záloh

### 3.2. Konfigurace

- Verzování v Git
- Záloha Kubernetes manifestů
- Záloha secrets

### 3.3. Aplikační data

- Záloha do S3
- Retence: 7 dní
- Šifrování dat

## 4. RTO (Recovery Time Objective)

- Kritické systémy: < 1 hodina
- Nejkritičtější systémy: < 15 minut
- Standardní systémy: < 4 hodiny

## 5. RPO (Recovery Point Objective)

- Kritické systémy: < 15 minut
- Nejkritičtější systémy: < 5 minut
- Standardní systémy: < 1 hodina

## 6. Testování DR plánu

### 6.1. Pravidelné testy

- Měsíční testy obnovy databáze
- Čtvrtletní testy obnovy clusteru
- Roční kompletní DR test

### 6.2. Dokumentace testů

- Záznam výsledků
- Identifikace problémů
- Plán nápravy

## 7. Kontaktní osoby

### 7.1. Primární kontakty

- Vedoucí DevOps: [jméno] ([email])
- Vedoucí vývoje: [jméno] ([email])
- Vedoucí infrastruktury: [jméno] ([email])

### 7.2. Sekundární kontakty

- Zástupce DevOps: [jméno] ([email])
- Zástupce vývoje: [jméno] ([email])
- Zástupce infrastruktury: [jméno] ([email])

## 8. Postup při havárii

1. Identifikace rozsahu havárie
2. Aktivace DR týmu
3. Spuštění příslušného DR postupu
4. Monitorování průběhu obnovy
5. Dokumentace incidentu
6. Analýza příčin
7. Implementace preventivních opatření

## 9. Dokumentace incidentů

### 9.1. Šablona dokumentace

- Datum a čas incidentu
- Popis incidentu
- Postup řešení
- Doba trvání
- Dopad na business
- Zjištěné příčiny
- Preventivní opatření

### 9.2. Archivace

- Uložení v centrálním systému
- Retence: 5 let
- Přístup: Omezený
