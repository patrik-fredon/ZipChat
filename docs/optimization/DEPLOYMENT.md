# Plán nasazení

## 1. Architektura nasazení

### 1.1 Komponenty

```
[CI/CD Pipeline] -> [Docker Registry] -> [Kubernetes Cluster]
     ^                    ^                    ^
     |                    |                    |
[GitHub]           [Docker Images]      [Raspberry Pi]
```

### 1.2 Topologie

```yaml
deployment:
  frontend:
    replicas: 3
    resources:
      cpu: '500m'
      memory: '512Mi'
    strategy:
      type: RollingUpdate
      maxSurge: 1
      maxUnavailable: 0

  backend:
    replicas: 3
    resources:
      cpu: '1000m'
      memory: '1Gi'
    strategy:
      type: RollingUpdate
      maxSurge: 1
      maxUnavailable: 0

  crypto:
    replicas: 2
    resources:
      cpu: '500m'
      memory: '512Mi'
    strategy:
      type: Recreate
```

## 2. CI/CD Pipeline

### 2.1 GitHub Actions workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Build and push Docker images
        uses: docker/build-push-action@v2
        with:
          context: .
          push: true
          tags: ghcr.io/zipchat/app:${{ github.sha }}

      - name: Deploy to Kubernetes
        uses: azure/k8s-deploy@v1
        with:
          namespace: zipchat
          manifests: k8s/
          images: ghcr.io/zipchat/app:${{ github.sha }}
```

### 2.2 Deployment pipeline

```typescript
// src/scripts/deploy.ts
interface DeploymentConfig {
	environment: 'dev' | 'staging' | 'prod';
	version: string;
	replicas: number;
	resources: {
		cpu: string;
		memory: string;
	};
}

export class DeploymentManager {
	public static async deploy(config: DeploymentConfig): Promise<void> {
		// 1. Validate configuration
		await this.validateConfig(config);

		// 2. Build and push Docker images
		await this.buildImages(config);

		// 3. Update Kubernetes manifests
		await this.updateManifests(config);

		// 4. Apply changes
		await this.applyChanges(config);

		// 5. Verify deployment
		await this.verifyDeployment(config);
	}
}
```

## 3. Docker konfigurace

### 3.1 Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3.2 Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

## 4. Kubernetes konfigurace

### 4.1 Deployment manifest

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zipchat-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: zipchat-frontend
  template:
    metadata:
      labels:
        app: zipchat-frontend
    spec:
      containers:
        - name: frontend
          image: ghcr.io/zipchat/frontend:latest
          ports:
            - containerPort: 80
          resources:
            limits:
              cpu: '500m'
              memory: '512Mi'
          livenessProbe:
            httpGet:
              path: /health
              port: 80
            initialDelaySeconds: 30
            periodSeconds: 10
```

### 4.2 Service manifest

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: zipchat-frontend
spec:
  selector:
    app: zipchat-frontend
  ports:
    - port: 80
      targetPort: 80
  type: ClusterIP
```

## 5. Monitoring nasazení

### 5.1 Health checks

```typescript
// src/lib/health/checks.ts
export class HealthChecker {
	public static async checkHealth(): Promise<HealthStatus> {
		return {
			status: 'healthy',
			components: {
				database: await this.checkDatabase(),
				redis: await this.checkRedis(),
				crypto: await this.checkCryptoService()
			},
			timestamp: new Date().toISOString()
		};
	}
}
```

### 5.2 Deployment metrics

```typescript
// src/lib/metrics/deployment.ts
export class DeploymentMetrics {
	public static async trackDeployment(version: string, environment: string, success: boolean) {
		await metrics.collect({
			name: 'deployment_status',
			value: success ? 1 : 0,
			labels: {
				version,
				environment
			}
		});
	}
}
```

## 6. Rollback strategie

### 6.1 Rollback postup

```typescript
// src/scripts/rollback.ts
export class RollbackManager {
	public static async rollback(version: string): Promise<void> {
		// 1. Zastavit aktuální deployment
		await this.stopCurrentDeployment();

		// 2. Obnovit předchozí verzi
		await this.restorePreviousVersion(version);

		// 3. Ověřit funkčnost
		await this.verifyRollback();

		// 4. Aktualizovat metriky
		await this.updateMetrics();
	}
}
```

### 6.2 Rollback metriky

```typescript
// src/lib/metrics/rollback.ts
export class RollbackMetrics {
	public static async trackRollback(fromVersion: string, toVersion: string, success: boolean) {
		await metrics.collect({
			name: 'rollback_status',
			value: success ? 1 : 0,
			labels: {
				from_version: fromVersion,
				to_version: toVersion
			}
		});
	}
}
```

## 7. Dokumentace nasazení

### 7.1 Deployment checklist

```markdown
# Deployment Checklist

## Před nasazením

- [ ] Všechny testy prošly
- [ ] Dokumentace je aktuální
- [ ] Backup databáze je vytvořen
- [ ] Rollback plán je připraven

## Během nasazení

- [ ] Monitoring je aktivní
- [ ] Logy jsou sledovány
- [ ] Health checks jsou prováděny
- [ ] Uživatelé jsou informováni

## Po nasazení

- [ ] Funkčnost je ověřena
- [ ] Performance je monitorována
- [ ] Chyby jsou logovány
- [ ] Feedback je sbírán
```

### 7.2 Incident response

```typescript
// src/lib/incident/response.ts
export class IncidentResponse {
	public static async handleIncident(severity: 'low' | 'medium' | 'high' | 'critical', type: 'deployment' | 'performance' | 'security'): Promise<void> {
		// 1. Zaznamenat incident
		await this.logIncident(severity, type);

		// 2. Notifikovat tým
		await this.notifyTeam(severity, type);

		// 3. Spustit response plán
		await this.executeResponsePlan(severity, type);

		// 4. Monitorovat řešení
		await this.monitorResolution();
	}
}
```
