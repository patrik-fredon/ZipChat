# Plán monitoringu

## 1. Architektura monitoringu

### 1.1 Komponenty

```
[Prometheus] -> [Grafana] -> [Alertmanager]
     ^
     |
[Exportéři] <- [Aplikace]
```

### 1.2 Metriky

```yaml
metrics:
  application:
    - request_count
    - response_time
    - error_rate
    - active_users
    - message_count

  system:
    - cpu_usage
    - memory_usage
    - disk_usage
    - network_traffic

  business:
    - user_registrations
    - message_volume
    - engagement_rate
    - retention_rate
```

## 2. Prometheus konfigurace

### 2.1 Hlavní konfigurace

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

### 2.2 Pravidla pro alerty

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

## 3. Grafana dashboardy

### 3.1 System Metrics

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

### 3.2 Application Metrics

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

## 4. Logging

### 4.1 Strukturované logy

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

### 4.2 Audit log

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

## 5. Alerting

### 5.1 Alertmanager konfigurace

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

### 5.2 Alert templates

```yaml
# alert_templates.yml
templates:
  - '*.tmpl'

templates:
  - name: alert_template
    template: |
      {{ define "alert_template" }}
      {{ if eq .Status "firing" }}
      🔥 [{{ .Status | toUpper }}] {{ .Labels.alertname }}
      {{ else }}
      ✅ [{{ .Status | toUpper }}] {{ .Labels.alertname }}
      {{ end }}
      {{ end }}
```

## 6. Tracing

### 6.1 OpenTelemetry konfigurace

```typescript
// src/lib/tracing/opentelemetry.ts
import { NodeTracerProvider } from '@opentelemetry/node';
import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const provider = new NodeTracerProvider();
const exporter = new JaegerExporter({
	serviceName: 'zipchat',
	host: process.env.JAEGER_HOST
});

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();
```

### 6.2 Trace kontext

```typescript
// src/lib/tracing/context.ts
export class TraceContext {
	public static async withTrace<T>(name: string, fn: (span: Span) => Promise<T>): Promise<T> {
		const tracer = opentelemetry.trace.getTracer('zipchat');
		return tracer.startActiveSpan(name, async (span) => {
			try {
				return await fn(span);
			} finally {
				span.end();
			}
		});
	}
}
```

## 7. Performance monitoring

### 7.1 Metriky výkonu

```typescript
// src/lib/monitoring/performance.ts
export class PerformanceMetrics {
	public static async trackRequest(method: string, path: string, duration: number, status: number) {
		await metrics.collect({
			name: 'http_request_duration_seconds',
			value: duration,
			labels: {
				method,
				path,
				status: status.toString()
			}
		});
	}

	public static async trackDatabaseQuery(query: string, duration: number, success: boolean) {
		await metrics.collect({
			name: 'database_query_duration_seconds',
			value: duration,
			labels: {
				query,
				success: success.toString()
			}
		});
	}
}
```

### 7.2 Profiling

```typescript
// src/lib/monitoring/profiling.ts
export class Profiler {
	public static async profile<T>(name: string, fn: () => Promise<T>): Promise<T> {
		const start = process.hrtime();
		try {
			return await fn();
		} finally {
			const [seconds, nanoseconds] = process.hrtime(start);
			const duration = seconds + nanoseconds / 1e9;
			await metrics.collect({
				name: 'function_duration_seconds',
				value: duration,
				labels: { function: name }
			});
		}
	}
}
```

## 8. Business metrics

### 8.1 Uživatelské metriky

```typescript
// src/lib/monitoring/business.ts
export class BusinessMetrics {
	public static async trackUserRegistration() {
		await metrics.collect({
			name: 'user_registrations_total',
			value: 1,
			labels: {}
		});
	}

	public static async trackMessageSent() {
		await metrics.collect({
			name: 'messages_sent_total',
			value: 1,
			labels: {}
		});
	}

	public static async trackUserEngagement(duration: number) {
		await metrics.collect({
			name: 'user_engagement_seconds',
			value: duration,
			labels: {}
		});
	}
}
```

### 8.2 Business dashboardy

```json
{
	"dashboard": {
		"id": null,
		"title": "Business Metrics",
		"tags": ["business"],
		"panels": [
			{
				"title": "User Growth",
				"type": "graph",
				"datasource": "Prometheus",
				"targets": [
					{
						"expr": "rate(user_registrations_total[1d])"
					}
				]
			},
			{
				"title": "Message Volume",
				"type": "graph",
				"datasource": "Prometheus",
				"targets": [
					{
						"expr": "rate(messages_sent_total[1h])"
					}
				]
			}
		]
	}
}
```

## 9. Dokumentace a reportování

### 9.1 Monitoring dokumentace

```markdown
# Monitoring Dokumentace

## Architektura

- Popis monitorovací architektury
- Metriky a jejich význam
- Alerty a jejich prahové hodnoty

## Dashboardy

- System metrics
- Application metrics
- Business metrics
- Custom dashboards

## Postupy

- Incident response
- Alert handling
- Performance tuning
```

### 9.2 Reporty

```typescript
// src/lib/reporting/metrics.ts
export class MetricsReport {
	public static async generateReport(period: string): Promise<Report> {
		const metrics = await this.collectMetrics(period);
		return {
			summary: {
				uptime: metrics.uptime,
				errorRate: metrics.errorRate,
				userGrowth: metrics.userGrowth,
				messageVolume: metrics.messageVolume
			},
			details: metrics.details
		};
	}
}
```
