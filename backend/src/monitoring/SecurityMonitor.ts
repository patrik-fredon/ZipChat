import { Logger } from '../utils/logger';
import { MetricsCollector } from './MetricsCollector';
import { Metric, MetricType } from './types/Metric';

export class SecurityMonitor {
  private metricsCollector: MetricsCollector;
  private logger: Logger;
  private isInitialized: boolean;
  private securityMetrics: Map<string, number>;

  constructor() {
    this.metricsCollector = MetricsCollector.getInstance();
    this.logger = new Logger('SecurityMonitor');
    this.isInitialized = false;
    this.securityMetrics = new Map();
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize security metrics
      this.initializeMetrics();
      this.initializeSecurityMetrics();
      this.isInitialized = true;
      this.logger.info('Security monitor initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize security monitor', error);
      throw error;
    }
  }

  private initializeMetrics(): void {
    // Initialize security metrics
    this.securityMetrics.set('failed_login_attempts', 0);
    this.securityMetrics.set('suspicious_activities', 0);
    this.securityMetrics.set('security_violations', 0);
    this.securityMetrics.set('access_denied', 0);
    this.securityMetrics.set('api_errors', 0);
  }

  private initializeSecurityMetrics(): void {
    // Metriky pro sledování autentizace
    this.metricsCollector.registerMetric('auth_attempts', MetricType.COUNTER, {
      help: 'Počet pokusů o přihlášení',
      labels: ['method', 'status']
    });

    this.metricsCollector.registerMetric('auth_failures', MetricType.COUNTER, {
      help: 'Počet neúspěšných pokusů o přihlášení',
      labels: ['method', 'reason']
    });

    // Metriky pro sledování autorizace
    this.metricsCollector.registerMetric('authorization_attempts', MetricType.COUNTER, {
      help: 'Počet pokusů o autorizaci',
      labels: ['resource', 'status']
    });

    this.metricsCollector.registerMetric('authorization_failures', MetricType.COUNTER, {
      help: 'Počet neúspěšných pokusů o autorizaci',
      labels: ['resource', 'reason']
    });

    // Metriky pro sledování bezpečnostních incidentů
    this.metricsCollector.registerMetric('security_incidents', MetricType.COUNTER, {
      help: 'Počet bezpečnostních incidentů',
      labels: ['type', 'severity']
    });

    this.metricsCollector.registerMetric('security_incident_response_time', MetricType.HISTOGRAM, {
      help: 'Doba reakce na bezpečnostní incident v milisekundách',
      labels: ['type']
    });

    // Metriky pro sledování API bezpečnosti
    this.metricsCollector.registerMetric('api_security_violations', MetricType.COUNTER, {
      help: 'Počet porušení bezpečnosti API',
      labels: ['type', 'endpoint']
    });

    this.metricsCollector.registerMetric('api_rate_limit_exceeded', MetricType.COUNTER, {
      help: 'Počet překročení limitu API',
      labels: ['endpoint', 'client']
    });
  }

  public async check(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Security monitor not initialized');
    }

    try {
      // Collect security metrics
      await this.collectSecurityMetrics();
      
      // Export metrics
      await this.exportMetrics();
    } catch (error) {
      this.logger.error('Failed to check security', error);
      throw error;
    }
  }

  private async collectSecurityMetrics(): Promise<void> {
    try {
      // TODO: Implement actual security metrics collection
      const securityMetrics: Metric[] = [
        {
          name: 'failed_login_attempts',
          type: MetricType.COUNTER,
          value: 0, // TODO: Implement actual failed login attempts collection
          timestamp: new Date(),
          labels: { source: 'web' }
        },
        {
          name: 'suspicious_activities',
          type: MetricType.COUNTER,
          value: 0, // TODO: Implement actual suspicious activities collection
          timestamp: new Date(),
          labels: { type: 'brute_force' }
        }
      ];

      await this.metricsCollector.collect();
    } catch (error) {
      this.logger.error('Failed to collect security metrics', error);
      throw error;
    }
  }

  private async exportMetrics(): Promise<void> {
    try {
      await this.metricsCollector.exportMetrics();
      this.logger.debug('Security metrics exported successfully');
    } catch (error) {
      this.logger.error('Failed to export security metrics', error);
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    this.isInitialized = false;
    this.logger.info('Security monitor shut down successfully');
  }

  // Metody pro sledování autentizace
  public trackAuthAttempt(method: string, status: 'success' | 'failure', reason?: string): void {
    this.metricsCollector.increment('auth_attempts', { method, status });
    
    if (status === 'failure') {
      this.metricsCollector.increment('auth_failures', { method, reason: reason || 'unknown' });
      this.securityMetrics.set('failed_login_attempts', (this.securityMetrics.get('failed_login_attempts') || 0) + 1);
    }
  }

  // Metody pro sledování autorizace
  public trackAuthorizationAttempt(resource: string, status: 'success' | 'failure', reason?: string): void {
    this.metricsCollector.increment('authorization_attempts', { resource, status });
    
    if (status === 'failure') {
      this.metricsCollector.increment('authorization_failures', { resource, reason: reason || 'unknown' });
      this.securityMetrics.set('access_denied', (this.securityMetrics.get('access_denied') || 0) + 1);
    }
  }

  // Metody pro sledování bezpečnostních incidentů
  public trackSecurityIncident(type: string, severity: 'low' | 'medium' | 'high' | 'critical', responseTime?: number): void {
    this.metricsCollector.increment('security_incidents', { type, severity });
    this.securityMetrics.set('security_violations', (this.securityMetrics.get('security_violations') || 0) + 1);
    
    if (responseTime !== undefined) {
      this.metricsCollector.observe('security_incident_response_time', responseTime, { type });
    }
  }

  // Metody pro sledování API bezpečnosti
  public trackApiSecurityViolation(type: string, endpoint: string): void {
    this.metricsCollector.increment('api_security_violations', { type, endpoint });
    this.securityMetrics.set('api_errors', (this.securityMetrics.get('api_errors') || 0) + 1);
  }

  public trackApiRateLimitExceeded(endpoint: string, client: string): void {
    this.metricsCollector.increment('api_rate_limit_exceeded', { endpoint, client });
    this.securityMetrics.set('suspicious_activities', (this.securityMetrics.get('suspicious_activities') || 0) + 1);
  }

  // Metoda pro získání aktuálních metrik
  public getCurrentMetrics(): Map<string, number> {
    return new Map(this.securityMetrics);
  }
} 