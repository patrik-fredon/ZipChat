# Monitoring and Logging

## Monitoring Architecture

### Components

```
[Prometheus] -> [Grafana] -> [Alertmanager]
     ^
     |
[Exporters] <- [Application]
```

## Prometheus Configuration

### Main Configuration

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

### Alert Rules

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

## Grafana Dashboards

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

### Structured Logs

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

### Alertmanager Configuration

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
  - 'alert_templates/*.tmpl'

templates:
  - name: default
    template: |
      {{ define "slack.default.title" }}
        [{{ .Status | toUpper }}{{ if eq .Status "firing" }}:{{ .Alerts.Firing | len }}{{ end }}] {{ .CommonLabels.alertname }}
      {{ end }}

      {{ define "slack.default.text" }}
        {{ range .Alerts }}
          *Alert:* {{ .Annotations.summary }}
          *Description:* {{ .Annotations.description }}
          *Details:*
          {{ range .Labels.SortedPairs }}
            • {{ .Name }}: {{ .Value }}
          {{ end }}
        {{ end }}
      {{ end }}
```

## Performance Monitoring

### Metrics Collection

```typescript
// src/lib/metrics/collector.ts
import { Counter, Gauge, Histogram } from 'prom-client';

export const metrics = {
	requests: new Counter({
		name: 'http_requests_total',
		help: 'Total number of HTTP requests',
		labelNames: ['method', 'path', 'status']
	}),

	responseTime: new Histogram({
		name: 'http_response_time_seconds',
		help: 'HTTP response time in seconds',
		labelNames: ['method', 'path']
	}),

	activeUsers: new Gauge({
		name: 'active_users',
		help: 'Number of active users'
	})
};
```

### Health Checks

```typescript
// src/lib/health/checks.ts
export class HealthChecker {
	public static async checkDatabase(): Promise<HealthStatus> {
		try {
			await db.query('SELECT 1');
			return { status: 'healthy' };
		} catch (error) {
			return { status: 'unhealthy', error: error.message };
		}
	}

	public static async checkRedis(): Promise<HealthStatus> {
		try {
			await redis.ping();
			return { status: 'healthy' };
		} catch (error) {
			return { status: 'unhealthy', error: error.message };
		}
	}
}
```

## Log Analysis

### Log Aggregation

```typescript
// src/lib/logs/aggregator.ts
export class LogAggregator {
	public static async aggregateLogs(query: LogQuery): Promise<LogAggregation> {
		const logs = await this.fetchLogs(query);
		return {
			total: logs.length,
			byLevel: this.groupByLevel(logs),
			byService: this.groupByService(logs),
			errors: this.filterErrors(logs)
		};
	}
}
```

### Error Tracking

```typescript
// src/lib/logs/error-tracker.ts
export class ErrorTracker {
	public static async trackError(error: Error, context: ErrorContext): Promise<void> {
		await this.sendToSentry(error, context);
		await this.notifyTeam(error, context);
		await this.logError(error, context);
	}
}
```
