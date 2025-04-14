# Infrastruktura

## Architektura

### Vysokoúrovňový přehled

```
[Klient] -> [Nginx] -> [Frontend/Backend] -> [Databáze]
                    -> [Kryptografický servis]
```

## Nginx Konfigurace

### Hlavní konfigurace

```nginx
# /etc/nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    keepalive_timeout 65;

    include /etc/nginx/conf.d/*.conf;
}
```

### Virtual Host

```nginx
# /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Kryptografický servis
    location /crypto {
        proxy_pass http://crypto:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Docker Konfigurace

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  nginx:
    image: nginx:latest
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/letsencrypt
    depends_on:
      - frontend
      - backend
      - crypto

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - API_URL=https://example.com/api

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - DB_URL=postgres://user:pass@postgres:5432/db
      - REDIS_URL=redis://redis:6379

  crypto:
    build:
      context: ./crypto
      dockerfile: Dockerfile
    environment:
      - PYTHONUNBUFFERED=1

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=db
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Raspberry Pi Cluster

### Konfigurace uzlu

```bash
# /boot/config.txt
# Overclocking a optimalizace
arm_freq=2000
core_freq=500
sdram_freq=450
over_voltage=6

# Vypnutí nepotřebných služeb
disable_splash=1
boot_delay=0
```

### Síťová konfigurace

```bash
# /etc/network/interfaces
auto eth0
iface eth0 inet static
    address 192.168.1.10
    netmask 255.255.255.0
    gateway 192.168.1.1
    dns-nameservers 8.8.8.8 8.8.4.4
```

## VPN Konfigurace (WireGuard)

### Server

```ini
# /etc/wireguard/wg0.conf
[Interface]
PrivateKey = SERVER_PRIVATE_KEY
Address = 10.0.0.1/24
ListenPort = 51820

[Peer]
PublicKey = CLIENT_PUBLIC_KEY
AllowedIPs = 10.0.0.2/32
```

### Klient

```ini
# /etc/wireguard/wg0.conf
[Interface]
PrivateKey = CLIENT_PRIVATE_KEY
Address = 10.0.0.2/24

[Peer]
PublicKey = SERVER_PUBLIC_KEY
Endpoint = server.example.com:51820
AllowedIPs = 0.0.0.0/0
```

## Monitoring

### Prometheus Konfigurace

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
```

### Grafana Dashboard

```json
{
	"dashboard": {
		"id": null,
		"title": "System Metrics",
		"tags": ["system"],
		"timezone": "browser",
		"panels": [
			{
				"title": "CPU Usage",
				"type": "graph",
				"datasource": "Prometheus",
				"targets": [
					{
						"expr": "rate(node_cpu_seconds_total{mode='user'}[5m])"
					}
				]
			}
		]
	}
}
```

## Backup a Recovery

### Backup skript

```bash
#!/bin/bash
# backup.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/$TIMESTAMP"

mkdir -p $BACKUP_DIR

# PostgreSQL backup
pg_dump -U user db > $BACKUP_DIR/db.sql

# MongoDB backup
mongodump --out $BACKUP_DIR/mongodb

# Konfigurační soubory
tar -czf $BACKUP_DIR/config.tar.gz /etc/nginx /etc/wireguard

# Šifrování zálohy
gpg --encrypt --recipient backup@example.com $BACKUP_DIR/*
```

### Recovery plán

```bash
#!/bin/bash
# recovery.sh

BACKUP_DIR=$1

# Obnovení PostgreSQL
psql -U user db < $BACKUP_DIR/db.sql

# Obnovení MongoDB
mongorestore $BACKUP_DIR/mongodb

# Obnovení konfigurace
tar -xzf $BACKUP_DIR/config.tar.gz -C /
```
