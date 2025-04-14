# Monitoring a Logging

## Architektura monitoringu

### Komponenty

```
[Prometheus] -> [Grafana] -> [Alertmanager]
     ^
     |
[Exportéři] <- [Aplikace]
```

## Prometheus Konfigurace

### Hlavní konfigurace

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  scrape_timeout: 10s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - 'alert_rules.yml'

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

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'application'
    static_configs:
      - targets: ['backend:3001', 'frontend:3000']
```

### Pravidla pro alerty

```yaml
# alert_rules.yml
groups:
  - name: system
    rules:
      - alert: HighCPUUsage
        expr: rate(node_cpu_seconds_total{mode="user"}[5m]) > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'High CPU usage'
          description: 'CPU usage is above 80% for 5 minutes'

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'High memory usage'
          description: 'Memory usage is above 90% for 5 minutes'
```

## Grafana Dashboardy

### System Metrics

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
			},
			{
				"title": "Memory Usage",
				"type": "graph",
				"datasource": "Prometheus",
				"targets": [
					{
						"expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes"
					}
				]
			}
		]
	}
}
```

### Application Metrics

```json
{
	"dashboard": {
		"id": null,
		"title": "Application Metrics",
		"tags": ["application"],
		"panels": [
			{
				"title": "Request Rate",
				"type": "graph",
				"datasource": "Prometheus",
				"targets": [
					{
						"expr": "rate(http_requests_total[5m])"
					}
				]
			},
			{
				"title": "Error Rate",
				"type": "graph",
				"datasource": "Prometheus",
				"targets": [
					{
						"expr": "rate(http_requests_total{status=~'5..'}[5m])"
					}
				]
			}
		]
	}
}
```

## Logging

### Strukturované logy

```typescript
// src/lib/logger/structured.ts
interface LogEntry {
	timestamp: string;
	level: 'info' | 'warn' | 'error' | 'debug';
	message: string;
	context: Record<string, unknown>;
	traceId?: string;
	spanId?: string;
}

export class StructuredLogger {
	public static info(message: string, context: Record<string, unknown> = {}) {
		this.log('info', message, context);
	}

	public static error(message: string, error: Error, context: Record<string, unknown> = {}) {
		this.log('error', message, {
			...context,
			error: {
				message: error.message,
				stack: error.stack,
				name: error.name
			}
		});
	}

	private static log(level: LogEntry['level'], message: string, context: Record<string, unknown>) {
		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level,
			message,
			context,
			traceId: this.getTraceId(),
			spanId: this.getSpanId()
		};

		console.log(JSON.stringify(entry));
	}
}
```

### Audit Log

```typescript
// src/lib/logger/audit.ts
interface AuditLog {
	timestamp: Date;
	userId?: string;
	ip: string;
	action: string;
	resource: string;
	status: 'success' | 'failure';
	metadata: Record<string, unknown>;
}

export class AuditLogger {
	public static async log(log: Omit<AuditLog, 'timestamp'>): Promise<void> {
		const entry: AuditLog = {
			...log,
			timestamp: new Date()
		};

		await db.collection('audit_logs').insertOne(entry);
	}
}
```

## Alerting

### Alertmanager Konfigurace

```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'slack'

receivers:
  - name: 'slack'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/...'
        channel: '#alerts'
        send_resolved: true
```

### Alert Templates

```yaml
# alert_templates.yml
templates:
  - '*.tmpl'

templates:
  - |
    {{ define "slack.default.title" }}
    [{{ .Status | toUpper }}{{ if eq .Status "firing" }}:{{ .Alerts.Firing | len }}{{ end }}] {{ .CommonLabels.alertname }}
    {{ end }}

    {{ define "slack.default.text" }}
    {{ range .Alerts }}
    *Alert:* {{ .Annotations.summary }}
    *Description:* {{ .Annotations.description }}
    *Details:*
    {{ range .Labels.SortedPairs }}• *{{ .Name }}:* `{{ .Value }}`
    {{ end }}
    {{ end }}
    {{ end }}
```

## Performance Monitoring

### Application Metrics

```typescript
// src/lib/metrics/app.ts
import { Counter, Histogram } from 'prom-client';

export const httpRequestsTotal = new Counter({
	name: 'http_requests_total',
	help: 'Total number of HTTP requests',
	labelNames: ['method', 'path', 'status']
});

export const httpRequestDuration = new Histogram({
	name: 'http_request_duration_seconds',
	help: 'HTTP request duration in seconds',
	labelNames: ['method', 'path'],
	buckets: [0.1, 0.5, 1, 2, 5]
});

export const databaseQueriesTotal = new Counter({
	name: 'database_queries_total',
	help: 'Total number of database queries',
	labelNames: ['operation', 'table']
});
```

### Middleware pro metriky

```typescript
// src/middleware/metrics.ts
import { httpRequestsTotal, httpRequestDuration } from '../lib/metrics/app';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const start = Date.now();

	res.on('finish', () => {
		const duration = (Date.now() - start) / 1000;

		httpRequestsTotal.inc({
			method: req.method,
			path: req.path,
			status: res.statusCode
		});

		httpRequestDuration.observe(
			{
				method: req.method,
				path: req.path
			},
			duration
		);
	});

	next();
};
```
