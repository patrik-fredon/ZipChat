import { MetricsCollector } from '../../src/monitoring/MetricsCollector';
import { MonitoringService } from '../../src/monitoring/MonitoringService';
import { AuthenticationService } from '../../src/services/AuthenticationService';
import { UserService } from '../../src/services/UserService';

describe('AuthenticationService', () => {
  let authService: AuthenticationService;
  let userService: UserService;
  let monitoringService: MonitoringService;
  let metricsCollector: MetricsCollector;

  beforeEach(async () => {
    metricsCollector = new MetricsCollector();
    monitoringService = new MonitoringService(metricsCollector);
    userService = new UserService();
    authService = new AuthenticationService(userService, monitoringService);
  });

  afterEach(async () => {
    await monitoringService.shutdown();
  });

  describe('register', () => {
    it('should track successful registration', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await authService.register(userData);
      expect(user).toBeDefined();

      const metrics = await metricsCollector.collect();
      const authAttempts = metrics.find(m => m.name === 'auth_attempts');
      expect(authAttempts).toBeDefined();
      expect(authAttempts?.value).toBe(1);
      expect(authAttempts?.labels?.success).toBe('true');
    });

    it('should track failed registration', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };

      await expect(authService.register(userData)).rejects.toThrow();

      const metrics = await metricsCollector.collect();
      const authFailures = metrics.find(m => m.name === 'auth_failures');
      expect(authFailures).toBeDefined();
      expect(authFailures?.value).toBe(1);
    });
  });

  describe('login', () => {
    it('should track successful login', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await authService.register(userData);
      const token = await authService.login(userData.email, userData.password);
      expect(token).toBeDefined();

      const metrics = await metricsCollector.collect();
      const authAttempts = metrics.find(m => m.name === 'auth_attempts');
      expect(authAttempts).toBeDefined();
      expect(authAttempts?.value).toBe(2);
      expect(authAttempts?.labels?.success).toBe('true');
    });

    it('should track failed login', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await authService.register(userData);
      await expect(authService.login(userData.email, 'wrong-password')).rejects.toThrow();

      const metrics = await metricsCollector.collect();
      const authFailures = metrics.find(m => m.name === 'auth_failures');
      expect(authFailures).toBeDefined();
      expect(authFailures?.value).toBe(1);
    });
  });

  describe('verifyToken', () => {
    it('should track security incident for invalid token', async () => {
      await expect(authService.verifyToken('invalid-token')).rejects.toThrow();

      const metrics = await metricsCollector.collect();
      const securityIncidents = metrics.find(m => m.name === 'security_incidents');
      expect(securityIncidents).toBeDefined();
      expect(securityIncidents?.value).toBe(1);
      expect(securityIncidents?.labels?.severity).toBe('high');
    });
  });

  describe('changePassword', () => {
    it('should track successful password change', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await authService.register(userData);
      await authService.changePassword(user.id, 'password123', 'newpassword123');

      const metrics = await metricsCollector.collect();
      const authAttempts = metrics.find(m => m.name === 'auth_attempts');
      expect(authAttempts).toBeDefined();
      expect(authAttempts?.value).toBe(2);
      expect(authAttempts?.labels?.success).toBe('true');
    });

    it('should track failed password change', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await authService.register(userData);
      await expect(authService.changePassword(user.id, 'wrong-password', 'newpassword123')).rejects.toThrow();

      const metrics = await metricsCollector.collect();
      const authFailures = metrics.find(m => m.name === 'auth_failures');
      expect(authFailures).toBeDefined();
      expect(authFailures?.value).toBe(1);
    });
  });

  describe('requestPasswordReset', () => {
    it('should track password reset request', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await authService.register(userData);
      await authService.requestPasswordReset(userData.email);

      const metrics = await metricsCollector.collect();
      const authAttempts = metrics.find(m => m.name === 'auth_attempts');
      expect(authAttempts).toBeDefined();
      expect(authAttempts?.value).toBe(2);
      expect(authAttempts?.labels?.success).toBe('true');
    });
  });

  describe('resetPassword', () => {
    it('should track successful password reset', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await authService.register(userData);
      const resetToken = await authService.requestPasswordReset(userData.email);
      await authService.resetPassword(resetToken, 'newpassword123');

      const metrics = await metricsCollector.collect();
      const authAttempts = metrics.find(m => m.name === 'auth_attempts');
      expect(authAttempts).toBeDefined();
      expect(authAttempts?.value).toBe(3);
      expect(authAttempts?.labels?.success).toBe('true');
    });

    it('should track failed password reset', async () => {
      await expect(authService.resetPassword('invalid-token', 'newpassword123')).rejects.toThrow();

      const metrics = await metricsCollector.collect();
      const securityIncidents = metrics.find(m => m.name === 'security_incidents');
      expect(securityIncidents).toBeDefined();
      expect(securityIncidents?.value).toBe(1);
      expect(securityIncidents?.labels?.severity).toBe('high');
    });
  });
}); 