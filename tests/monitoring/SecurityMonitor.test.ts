import { MetricsCollector } from '../../src/monitoring/MetricsCollector';
import { SecurityMonitor } from '../../src/monitoring/SecurityMonitor';

describe('SecurityMonitor', () => {
  let securityMonitor: SecurityMonitor;
  let metricsCollector: MetricsCollector;

  beforeEach(() => {
    metricsCollector = MetricsCollector.getInstance();
    securityMonitor = new SecurityMonitor();
  });

  afterEach(async () => {
    await securityMonitor.shutdown();
  });

  describe('trackAuthAttempt', () => {
    it('should increment auth_attempts metric on successful attempt', async () => {
      await securityMonitor.initialize();
      securityMonitor.trackAuthAttempt('password', 'success');
      
      const metrics = await metricsCollector.getMetrics();
      const authAttempts = metrics.find(m => m.name === 'auth_attempts');
      
      expect(authAttempts).toBeDefined();
      expect(authAttempts?.value).toBe(1);
      expect(authAttempts?.labels).toEqual({ method: 'password', status: 'success' });
    });

    it('should increment auth_failures metric on failed attempt', async () => {
      await securityMonitor.initialize();
      securityMonitor.trackAuthAttempt('password', 'failure', 'invalid_credentials');
      
      const metrics = await metricsCollector.getMetrics();
      const authFailures = metrics.find(m => m.name === 'auth_failures');
      
      expect(authFailures).toBeDefined();
      expect(authFailures?.value).toBe(1);
      expect(authFailures?.labels).toEqual({ method: 'password', reason: 'invalid_credentials' });
    });
  });

  describe('trackAuthorizationAttempt', () => {
    it('should increment authorization_attempts metric on successful attempt', async () => {
      await securityMonitor.initialize();
      securityMonitor.trackAuthorizationAttempt('messages', 'success');
      
      const metrics = await metricsCollector.getMetrics();
      const authAttempts = metrics.find(m => m.name === 'authorization_attempts');
      
      expect(authAttempts).toBeDefined();
      expect(authAttempts?.value).toBe(1);
      expect(authAttempts?.labels).toEqual({ resource: 'messages', status: 'success' });
    });

    it('should increment authorization_failures metric on failed attempt', async () => {
      await securityMonitor.initialize();
      securityMonitor.trackAuthorizationAttempt('messages', 'failure', 'insufficient_permissions');
      
      const metrics = await metricsCollector.getMetrics();
      const authFailures = metrics.find(m => m.name === 'authorization_failures');
      
      expect(authFailures).toBeDefined();
      expect(authFailures?.value).toBe(1);
      expect(authFailures?.labels).toEqual({ resource: 'messages', reason: 'insufficient_permissions' });
    });
  });

  describe('trackSecurityIncident', () => {
    it('should increment security_incidents metric', async () => {
      await securityMonitor.initialize();
      securityMonitor.trackSecurityIncident('brute_force', 'high', 500);
      
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
    it('should increment api_security_violations metric', async () => {
      await securityMonitor.initialize();
      securityMonitor.trackApiSecurityViolation('xss', '/api/messages');
      
      const metrics = await metricsCollector.getMetrics();
      const violations = metrics.find(m => m.name === 'api_security_violations');
      
      expect(violations).toBeDefined();
      expect(violations?.value).toBe(1);
      expect(violations?.labels).toEqual({ type: 'xss', endpoint: '/api/messages' });
    });
  });

  describe('trackApiRateLimitExceeded', () => {
    it('should increment api_rate_limit_exceeded metric', async () => {
      await securityMonitor.initialize();
      securityMonitor.trackApiRateLimitExceeded('/api/messages', 'client1');
      
      const metrics = await metricsCollector.getMetrics();
      const rateLimit = metrics.find(m => m.name === 'api_rate_limit_exceeded');
      
      expect(rateLimit).toBeDefined();
      expect(rateLimit?.value).toBe(1);
      expect(rateLimit?.labels).toEqual({ endpoint: '/api/messages', client: 'client1' });
    });
  });

  describe('getCurrentMetrics', () => {
    it('should return current security metrics', async () => {
      await securityMonitor.initialize();
      
      securityMonitor.trackAuthAttempt('password', 'failure', 'invalid_credentials');
      securityMonitor.trackAuthorizationAttempt('messages', 'failure', 'insufficient_permissions');
      securityMonitor.trackSecurityIncident('brute_force', 'high');
      securityMonitor.trackApiSecurityViolation('xss', '/api/messages');
      securityMonitor.trackApiRateLimitExceeded('/api/messages', 'client1');
      
      const metrics = securityMonitor.getCurrentMetrics();
      
      expect(metrics.get('failed_login_attempts')).toBe(1);
      expect(metrics.get('access_denied')).toBe(1);
      expect(metrics.get('security_violations')).toBe(1);
      expect(metrics.get('api_errors')).toBe(1);
      expect(metrics.get('suspicious_activities')).toBe(1);
    });
  });
});

describe('SecurityMonitor - New Metrics', () => {
  let securityMonitor: SecurityMonitor;
  let metricsCollector: MetricsCollector;

  beforeEach(() => {
    metricsCollector = new MetricsCollector();
    securityMonitor = new SecurityMonitor(metricsCollector);
  });

  describe('Authentication Metrics', () => {
    it('should track authentication attempts', () => {
      securityMonitor.trackAuthAttempt('password', 'success');
      const metric = metricsCollector.getMetric('auth_attempts');
      expect(metric).toBeDefined();
      expect(metric?.values[0].value).toBe(1);
      expect(metric?.values[0].labels).toEqual({
        method: 'password',
        status: 'success'
      });
    });

    it('should track authentication failures', () => {
      securityMonitor.trackAuthFailure('password', 'invalid_credentials');
      const metric = metricsCollector.getMetric('auth_failures');
      expect(metric).toBeDefined();
      expect(metric?.values[0].value).toBe(1);
      expect(metric?.values[0].labels).toEqual({
        method: 'password',
        reason: 'invalid_credentials'
      });
    });
  });

  describe('Authorization Metrics', () => {
    it('should track authorization attempts', () => {
      securityMonitor.trackAuthzAttempt('user_profile', 'success');
      const metric = metricsCollector.getMetric('authorization_attempts');
      expect(metric).toBeDefined();
      expect(metric?.values[0].value).toBe(1);
      expect(metric?.values[0].labels).toEqual({
        resource: 'user_profile',
        status: 'success'
      });
    });

    it('should track authorization failures', () => {
      securityMonitor.trackAuthzFailure('user_profile', 'insufficient_permissions');
      const metric = metricsCollector.getMetric('authorization_failures');
      expect(metric).toBeDefined();
      expect(metric?.values[0].value).toBe(1);
      expect(metric?.values[0].labels).toEqual({
        resource: 'user_profile',
        reason: 'insufficient_permissions'
      });
    });
  });

  describe('Security Incident Metrics', () => {
    it('should track security incidents', () => {
      securityMonitor.trackSecurityIncident('brute_force', 'high');
      const metric = metricsCollector.getMetric('security_incidents');
      expect(metric).toBeDefined();
      expect(metric?.values[0].value).toBe(1);
      expect(metric?.values[0].labels).toEqual({
        type: 'brute_force',
        severity: 'high'
      });
    });

    it('should track security incident response time', () => {
      securityMonitor.trackSecurityIncidentResponseTime('brute_force', 150);
      const metric = metricsCollector.getMetric('security_incident_response_time');
      expect(metric).toBeDefined();
      expect(metric?.values[0].value).toBe(150);
      expect(metric?.values[0].labels).toEqual({
        type: 'brute_force'
      });
    });
  });

  describe('API Security Metrics', () => {
    it('should track API security violations', () => {
      securityMonitor.trackApiSecurityViolation('sql_injection', '/api/users');
      const metric = metricsCollector.getMetric('api_security_violations');
      expect(metric).toBeDefined();
      expect(metric?.values[0].value).toBe(1);
      expect(metric?.values[0].labels).toEqual({
        type: 'sql_injection',
        endpoint: '/api/users'
      });
    });

    it('should track API rate limit exceeded', () => {
      securityMonitor.trackApiRateLimitExceeded('/api/users', 'client_123');
      const metric = metricsCollector.getMetric('api_rate_limit_exceeded');
      expect(metric).toBeDefined();
      expect(metric?.values[0].value).toBe(1);
      expect(metric?.values[0].labels).toEqual({
        endpoint: '/api/users',
        client: 'client_123'
      });
    });
  });
}); 