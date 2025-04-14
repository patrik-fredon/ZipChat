import { MetricsCollector } from '../../src/monitoring/MetricsCollector';
import { MonitoringService } from '../../src/monitoring/MonitoringService';
import { PerformanceMonitor } from '../../src/monitoring/PerformanceMonitor';
import { SecurityMonitor } from '../../src/monitoring/SecurityMonitor';

describe('MonitoringService', () => {
  let monitoringService: MonitoringService;
  let metricsCollector: MetricsCollector;
  let performanceMonitor: PerformanceMonitor;
  let securityMonitor: SecurityMonitor;

  beforeEach(() => {
    monitoringService = MonitoringService.getInstance();
    metricsCollector = MetricsCollector.getInstance();
    performanceMonitor = new PerformanceMonitor();
    securityMonitor = new SecurityMonitor();
  });

  afterEach(async () => {
    await monitoringService.shutdown();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = MonitoringService.getInstance();
      const instance2 = MonitoringService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should initialize all components', async () => {
      const metricsCollectorSpy = jest.spyOn(metricsCollector, 'initialize');
      const performanceMonitorSpy = jest.spyOn(performanceMonitor, 'initialize');
      const securityMonitorSpy = jest.spyOn(securityMonitor, 'initialize');

      await monitoringService.initialize();

      expect(metricsCollectorSpy).toHaveBeenCalled();
      expect(performanceMonitorSpy).toHaveBeenCalled();
      expect(securityMonitorSpy).toHaveBeenCalled();
    });

    it('should throw error if initialization fails', async () => {
      jest.spyOn(metricsCollector, 'initialize').mockRejectedValue(new Error('Initialization failed'));

      await expect(monitoringService.initialize()).rejects.toThrow('Initialization failed');
    });
  });

  describe('collectMetrics', () => {
    it('should collect metrics successfully', async () => {
      const metricsCollectorSpy = jest.spyOn(metricsCollector, 'collect');

      await monitoringService.collectMetrics();

      expect(metricsCollectorSpy).toHaveBeenCalled();
    });

    it('should handle errors during metrics collection', async () => {
      jest.spyOn(metricsCollector, 'collect').mockRejectedValue(new Error('Collection failed'));

      await monitoringService.collectMetrics();
      // Should not throw, just log error
    });
  });

  describe('monitorPerformance', () => {
    it('should monitor performance successfully', async () => {
      const performanceMonitorSpy = jest.spyOn(performanceMonitor, 'monitor');

      await monitoringService.monitorPerformance();

      expect(performanceMonitorSpy).toHaveBeenCalled();
    });

    it('should handle errors during performance monitoring', async () => {
      jest.spyOn(performanceMonitor, 'monitor').mockRejectedValue(new Error('Monitoring failed'));

      await monitoringService.monitorPerformance();
      // Should not throw, just log error
    });
  });

  describe('checkSecurity', () => {
    it('should check security successfully', async () => {
      const securityMonitorSpy = jest.spyOn(securityMonitor, 'check');

      await monitoringService.checkSecurity();

      expect(securityMonitorSpy).toHaveBeenCalled();
    });

    it('should handle errors during security check', async () => {
      jest.spyOn(securityMonitor, 'check').mockRejectedValue(new Error('Security check failed'));

      await monitoringService.checkSecurity();
      // Should not throw, just log error
    });
  });

  describe('shutdown', () => {
    it('should shutdown all components', async () => {
      const metricsCollectorSpy = jest.spyOn(metricsCollector, 'shutdown');
      const performanceMonitorSpy = jest.spyOn(performanceMonitor, 'shutdown');
      const securityMonitorSpy = jest.spyOn(securityMonitor, 'shutdown');

      await monitoringService.shutdown();

      expect(metricsCollectorSpy).toHaveBeenCalled();
      expect(performanceMonitorSpy).toHaveBeenCalled();
      expect(securityMonitorSpy).toHaveBeenCalled();
    });

    it('should handle errors during shutdown', async () => {
      jest.spyOn(metricsCollector, 'shutdown').mockRejectedValue(new Error('Shutdown failed'));

      await monitoringService.shutdown();
      // Should not throw, just log error
    });
  });

  describe('trackAuthAttempt', () => {
    it('should track successful auth attempt', async () => {
      await monitoringService.initialize();
      monitoringService.trackAuthAttempt('password', 'success');
      
      const metrics = await metricsCollector.getMetrics();
      const authAttempts = metrics.find(m => m.name === 'auth_attempts');
      
      expect(authAttempts).toBeDefined();
      expect(authAttempts?.value).toBe(1);
      expect(authAttempts?.labels).toEqual({ method: 'password', status: 'success' });
    });

    it('should track failed auth attempt', async () => {
      await monitoringService.initialize();
      monitoringService.trackAuthAttempt('password', 'failure', 'invalid_credentials');
      
      const metrics = await metricsCollector.getMetrics();
      const authFailures = metrics.find(m => m.name === 'auth_failures');
      
      expect(authFailures).toBeDefined();
      expect(authFailures?.value).toBe(1);
      expect(authFailures?.labels).toEqual({ method: 'password', reason: 'invalid_credentials' });
    });
  });

  describe('trackAuthorizationAttempt', () => {
    it('should track successful authorization attempt', async () => {
      await monitoringService.initialize();
      monitoringService.trackAuthorizationAttempt('messages', 'success');
      
      const metrics = await metricsCollector.getMetrics();
      const authAttempts = metrics.find(m => m.name === 'authorization_attempts');
      
      expect(authAttempts).toBeDefined();
      expect(authAttempts?.value).toBe(1);
      expect(authAttempts?.labels).toEqual({ resource: 'messages', status: 'success' });
    });

    it('should track failed authorization attempt', async () => {
      await monitoringService.initialize();
      monitoringService.trackAuthorizationAttempt('messages', 'failure', 'insufficient_permissions');
      
      const metrics = await metricsCollector.getMetrics();
      const authFailures = metrics.find(m => m.name === 'authorization_failures');
      
      expect(authFailures).toBeDefined();
      expect(authFailures?.value).toBe(1);
      expect(authFailures?.labels).toEqual({ resource: 'messages', reason: 'insufficient_permissions' });
    });
  });

  describe('trackSecurityIncident', () => {
    it('should track security incident', async () => {
      await monitoringService.initialize();
      monitoringService.trackSecurityIncident('brute_force', 'high', 500);
      
      const metrics = await metricsCollector.getMetrics();
      const incidents = metrics.find(m => m.name === 'security_incidents');
      const responseTime = metrics.find(m => m.name === 'security_incident_response_time');
      
      expect(incidents).toBeDefined();
      expect(incidents?.value).toBe(1);
      expect(incidents?.labels).toEqual({ type: 'brute_force', severity: 'high' });
      
      expect(responseTime).toBeDefined();
      expect(responseTime?.value).toBe(500);
      expect(responseTime?.labels).toEqual({ type: 'brute_force' });
    });
  });

  describe('trackApiSecurityViolation', () => {
    it('should track API security violation', async () => {
      await monitoringService.initialize();
      monitoringService.trackApiSecurityViolation('xss', '/api/messages');
      
      const metrics = await metricsCollector.getMetrics();
      const violations = metrics.find(m => m.name === 'api_security_violations');
      
      expect(violations).toBeDefined();
      expect(violations?.value).toBe(1);
      expect(violations?.labels).toEqual({ type: 'xss', endpoint: '/api/messages' });
    });
  });

  describe('trackApiRateLimitExceeded', () => {
    it('should track API rate limit exceeded', async () => {
      await monitoringService.initialize();
      monitoringService.trackApiRateLimitExceeded('/api/messages', 'client1');
      
      const metrics = await metricsCollector.getMetrics();
      const rateLimit = metrics.find(m => m.name === 'api_rate_limit_exceeded');
      
      expect(rateLimit).toBeDefined();
      expect(rateLimit?.value).toBe(1);
      expect(rateLimit?.labels).toEqual({ endpoint: '/api/messages', client: 'client1' });
    });
  });

  describe('getSecurityMetrics', () => {
    it('should return current security metrics', async () => {
      await monitoringService.initialize();
      
      monitoringService.trackAuthAttempt('password', 'failure', 'invalid_credentials');
      monitoringService.trackAuthorizationAttempt('messages', 'failure', 'insufficient_permissions');
      monitoringService.trackSecurityIncident('brute_force', 'high');
      monitoringService.trackApiSecurityViolation('xss', '/api/messages');
      monitoringService.trackApiRateLimitExceeded('/api/messages', 'client1');
      
      const metrics = monitoringService.getSecurityMetrics();
      
      expect(metrics.get('failed_login_attempts')).toBe(1);
      expect(metrics.get('access_denied')).toBe(1);
      expect(metrics.get('security_violations')).toBe(1);
      expect(metrics.get('api_errors')).toBe(1);
      expect(metrics.get('suspicious_activities')).toBe(1);
    });
  });
}); 