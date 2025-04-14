import { Logger } from '../utils/Logger';
import { NotificationService } from './NotificationService';

export class NotificationABTestSimulator {
  private notificationService: NotificationService;
  private logger: Logger;

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
    this.logger = new Logger('NotificationABTestSimulator');
  }

  async simulateTest(test: NotificationABTest, options: {
    userCount: number;
    duration: number;
    interval: number;
  }): Promise<SimulationResults> {
    this.logger.info(`Starting simulation for test: ${test.name}`);
    
    const results: SimulationResults = {
      testId: test._id,
      name: test.name,
      startTime: new Date(),
      endTime: null,
      metrics: {
        totalUsers: options.userCount,
        notificationsSent: 0,
        notificationsDelivered: 0,
        notificationsOpened: 0,
        notificationsClicked: 0,
        variantMetrics: {}
      },
      errors: []
    };

    try {
      // Simulace uživatelů
      const users = this.generateTestUsers(options.userCount);
      
      // Simulace notifikací v časových intervalech
      const intervalId = setInterval(async () => {
        if (Date.now() - results.startTime.getTime() >= options.duration) {
          clearInterval(intervalId);
          results.endTime = new Date();
          this.logger.info(`Simulation completed for test: ${test.name}`);
          return;
        }

        // Odeslání notifikací pro náhodný vzorek uživatelů
        const sampleUsers = this.getRandomSample(users, Math.floor(users.length * 0.1));
        
        for (const user of sampleUsers) {
          try {
            const variant = this.selectVariant(test.variants);
            const notification = await this.notificationService.sendNotification({
              userId: user.id,
              variantId: variant._id,
              testId: test._id
            });

            results.metrics.notificationsSent++;
            
            // Simulace doručení a interakce
            if (Math.random() < 0.95) {
              results.metrics.notificationsDelivered++;
              
              if (Math.random() < variant.openRate) {
                results.metrics.notificationsOpened++;
                
                if (Math.random() < variant.clickRate) {
                  results.metrics.notificationsClicked++;
                }
              }
            }

            // Aktualizace metrik pro variantu
            if (!results.metrics.variantMetrics[variant._id]) {
              results.metrics.variantMetrics[variant._id] = {
                sent: 0,
                delivered: 0,
                opened: 0,
                clicked: 0
              };
            }

            results.metrics.variantMetrics[variant._id].sent++;
            if (notification.delivered) results.metrics.variantMetrics[variant._id].delivered++;
            if (notification.opened) results.metrics.variantMetrics[variant._id].opened++;
            if (notification.clicked) results.metrics.variantMetrics[variant._id].clicked++;
          } catch (error) {
            results.errors.push({
              timestamp: new Date(),
              userId: user.id,
              error: error.message
            });
          }
        }
      }, options.interval);

    } catch (error) {
      this.logger.error(`Simulation failed for test: ${test.name}`, error);
      throw error;
    }

    return results;
  }

  private generateTestUsers(count: number): TestUser[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `test-user-${i}`,
      deviceType: this.getRandomDeviceType(),
      timezone: this.getRandomTimezone()
    }));
  }

  private getRandomDeviceType(): string {
    const types = ['android', 'ios', 'web'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getRandomTimezone(): string {
    const timezones = ['Europe/Prague', 'UTC', 'America/New_York'];
    return timezones[Math.floor(Math.random() * timezones.length)];
  }

  private selectVariant(variants: any[]): any {
    const total = variants.reduce((sum, v) => sum + v.percentage, 0);
    let random = Math.random() * total;
    
    for (const variant of variants) {
      random -= variant.percentage;
      if (random <= 0) {
        return variant;
      }
    }
    
    return variants[0];
  }

  private getRandomSample<T>(array: T[], size: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
  }
}

interface TestUser {
  id: string;
  deviceType: string;
  timezone: string;
}

interface SimulationResults {
  testId: string;
  name: string;
  startTime: Date;
  endTime: Date | null;
  metrics: {
    totalUsers: number;
    notificationsSent: number;
    notificationsDelivered: number;
    notificationsOpened: number;
    notificationsClicked: number;
    variantMetrics: {
      [variantId: string]: {
        sent: number;
        delivered: number;
        opened: number;
        clicked: number;
      };
    };
  };
  errors: Array<{
    timestamp: Date;
    userId: string;
    error: string;
  }>;
} 