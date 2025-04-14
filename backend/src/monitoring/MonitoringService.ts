import { Logger } from '../utils/logger';
import { MetricsCollector } from './MetricsCollector';
import { PerformanceMonitor } from './PerformanceMonitor';
import { SecurityMonitor } from './SecurityMonitor';

export class MonitoringService {
  private static instance: MonitoringService;
  private metricsCollector: MetricsCollector;
  private performanceMonitor: PerformanceMonitor;
  private securityMonitor: SecurityMonitor;
  private logger: Logger;

  private constructor() {
    this.logger = new Logger('MonitoringService');
    this.metricsCollector = new MetricsCollector();
    this.performanceMonitor = new PerformanceMonitor();
    this.securityMonitor = new SecurityMonitor();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      await this.metricsCollector.initialize();
      await this.performanceMonitor.initialize();
      await this.securityMonitor.initialize();
      this.logger.info('Monitoring service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize monitoring service', error);
      throw error;
    }
  }

  public async collectMetrics(): Promise<void> {
    try {
      await this.metricsCollector.collect();
      this.logger.debug('Metrics collected successfully');
    } catch (error) {
      this.logger.error('Failed to collect metrics', error);
    }
  }

  public async monitorPerformance(): Promise<void> {
    try {
      await this.performanceMonitor.monitor();
      this.logger.debug('Performance monitoring completed');
    } catch (error) {
      this.logger.error('Failed to monitor performance', error);
    }
  }

  public async checkSecurity(): Promise<void> {
    try {
      await this.securityMonitor.check();
      this.logger.debug('Security check completed');
    } catch (error) {
      this.logger.error('Failed to perform security check', error);
    }
  }

  public async shutdown(): Promise<void> {
    try {
      await this.metricsCollector.shutdown();
      await this.performanceMonitor.shutdown();
      await this.securityMonitor.shutdown();
      this.logger.info('Monitoring service shut down successfully');
    } catch (error) {
      this.logger.error('Failed to shut down monitoring service', error);
    }
  }

  // Metody pro sledování autentizace
  public trackAuthAttempt(method: string, status: 'success' | 'failure', reason?: string): void {
    this.securityMonitor.trackAuthAttempt(method, status, reason);
  }

  // Metody pro sledování autorizace
  public trackAuthorizationAttempt(resource: string, status: 'success' | 'failure', reason?: string): void {
    this.securityMonitor.trackAuthorizationAttempt(resource, status, reason);
  }

  // Metody pro sledování bezpečnostních incidentů
  public trackSecurityIncident(type: string, severity: 'low' | 'medium' | 'high' | 'critical', responseTime?: number): void {
    this.securityMonitor.trackSecurityIncident(type, severity, responseTime);
  }

  // Metody pro sledování API bezpečnosti
  public trackApiSecurityViolation(type: string, endpoint: string): void {
    this.securityMonitor.trackApiSecurityViolation(type, endpoint);
  }

  public trackApiRateLimitExceeded(endpoint: string, client: string): void {
    this.securityMonitor.trackApiRateLimitExceeded(endpoint, client);
  }

  // Metoda pro získání aktuálních bezpečnostních metrik
  public getSecurityMetrics(): Map<string, number> {
    return this.securityMonitor.getCurrentMetrics();
  }
} 