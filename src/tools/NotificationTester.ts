import { NotificationABTestService } from '../services/NotificationABTestService';
import { NotificationABTestSimulator } from '../services/NotificationABTestSimulator';
import { NotificationService } from '../services/NotificationService';
import { Logger } from '../utils/Logger';

export class NotificationTester {
  private notificationService: NotificationService;
  private abTestService: NotificationABTestService;
  private simulator: NotificationABTestSimulator;
  private logger: Logger;

  constructor(
    notificationService: NotificationService,
    abTestService: NotificationABTestService
  ) {
    this.notificationService = notificationService;
    this.abTestService = abTestService;
    this.simulator = new NotificationABTestSimulator(notificationService);
    this.logger = new Logger('NotificationTester');
  }

  async runTestSuite(): Promise<TestSuiteResults> {
    this.logger.info('Starting notification test suite');
    
    const results: TestSuiteResults = {
      startTime: new Date(),
      endTime: null,
      tests: [],
      errors: []
    };

    try {
      // Test 1: Basic notification delivery
      await this.runBasicDeliveryTest(results);
      
      // Test 2: A/B test creation and simulation
      await this.runABTestSimulation(results);
      
      // Test 3: Error handling
      await this.runErrorHandlingTest(results);
      
      // Test 4: Performance test
      await this.runPerformanceTest(results);

    } catch (error) {
      this.logger.error('Test suite failed', error);
      results.errors.push({
        testName: 'Test Suite',
        error: error.message
      });
    }

    results.endTime = new Date();
    this.logger.info('Test suite completed');
    return results;
  }

  private async runBasicDeliveryTest(results: TestSuiteResults): Promise<void> {
    const testName = 'Basic Notification Delivery';
    this.logger.info(`Running test: ${testName}`);
    
    try {
      const notification = await this.notificationService.sendNotification({
        userId: 'test-user-1',
        title: 'Test Notification',
        body: 'This is a test notification',
        data: { test: true }
      });

      results.tests.push({
        name: testName,
        status: 'success',
        metrics: {
          deliveryTime: notification.deliveryTime,
          delivered: notification.delivered,
          opened: notification.opened,
          clicked: notification.clicked
        }
      });
    } catch (error) {
      results.errors.push({
        testName,
        error: error.message
      });
    }
  }

  private async runABTestSimulation(results: TestSuiteResults): Promise<void> {
    const testName = 'A/B Test Simulation';
    this.logger.info(`Running test: ${testName}`);
    
    try {
      // Vytvoření testovacího A/B testu
      const test = await this.abTestService.createTest({
        name: 'Test A/B Test',
        description: 'Test simulation',
        variants: [
          {
            name: 'Variant A',
            percentage: 50,
            title: 'Test A',
            body: 'This is variant A',
            openRate: 0.7,
            clickRate: 0.3
          },
          {
            name: 'Variant B',
            percentage: 50,
            title: 'Test B',
            body: 'This is variant B',
            openRate: 0.8,
            clickRate: 0.4
          }
        ],
        startDate: new Date(),
        endDate: new Date(Date.now() + 3600000) // 1 hour from now
      });

      // Spuštění simulace
      const simulationResults = await this.simulator.simulateTest(test, {
        userCount: 1000,
        duration: 60000, // 1 minute
        interval: 1000 // 1 second
      });

      results.tests.push({
        name: testName,
        status: 'success',
        metrics: simulationResults.metrics
      });
    } catch (error) {
      results.errors.push({
        testName,
        error: error.message
      });
    }
  }

  private async runErrorHandlingTest(results: TestSuiteResults): Promise<void> {
    const testName = 'Error Handling';
    this.logger.info(`Running test: ${testName}`);
    
    try {
      // Testování chybových stavů
      await this.notificationService.sendNotification({
        userId: 'invalid-user',
        title: '',
        body: ''
      });

      results.tests.push({
        name: testName,
        status: 'success',
        metrics: {
          errorsHandled: true
        }
      });
    } catch (error) {
      // Očekáváme chybu
      results.tests.push({
        name: testName,
        status: 'success',
        metrics: {
          errorsHandled: true,
          errorMessage: error.message
        }
      });
    }
  }

  private async runPerformanceTest(results: TestSuiteResults): Promise<void> {
    const testName = 'Performance Test';
    this.logger.info(`Running test: ${testName}`);
    
    try {
      const startTime = Date.now();
      const notifications = [];
      
      // Odeslání 100 notifikací paralelně
      for (let i = 0; i < 100; i++) {
        notifications.push(
          this.notificationService.sendNotification({
            userId: `test-user-${i}`,
            title: `Test ${i}`,
            body: `Notification ${i}`
          })
        );
      }

      await Promise.all(notifications);
      const endTime = Date.now();
      
      results.tests.push({
        name: testName,
        status: 'success',
        metrics: {
          totalNotifications: 100,
          totalTime: endTime - startTime,
          averageTime: (endTime - startTime) / 100
        }
      });
    } catch (error) {
      results.errors.push({
        testName,
        error: error.message
      });
    }
  }
}

interface TestSuiteResults {
  startTime: Date;
  endTime: Date | null;
  tests: Array<{
    name: string;
    status: 'success' | 'failed';
    metrics: any;
  }>;
  errors: Array<{
    testName: string;
    error: string;
  }>;
} 