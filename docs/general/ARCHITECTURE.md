# ZipChat - Bezpečná komunikační platforma

## Obsah

1. [Architektura systému](#architektura-systému)
2. [Frontend implementace](#frontend-implementace)
3. [Backend implementace](#backend-implementace)
4. [Databázová vrstva](#databázová-vrstva)
5. [Bezpečnostní implementace](#bezpečnostní-implementace)
6. [Infrastruktura](#infrastruktura)
7. [Monitoring a logging](#monitoring-a-logging)

## Architektura systému

### Vysokoúrovňový přehled

Systém je navržen jako mikroservisní architektura s následujícími hlavními komponentami:

- Frontend (Next.js)
- Backend API (Node.js)
- Kryptografický servis (Python/Flask)
- Databázové vrstvy (PostgreSQL, MongoDB)
- Infrastrukturní vrstva (Nginx, Coolify)

### Komunikační toky

1. Klient -> Nginx (HTTPS)
2. Nginx -> Frontend/Backend
3. Backend -> Kryptografický servis
4. Backend -> Databáze

### Bezpečnostní vrstvy

- Transportní šifrování (TLS 1.3)
- End-to-end šifrování (AES-256-GCM)
- Zero-knowledge architektura
- Perfect Forward Secrecy
