import { Request, Response } from 'express';
import { z } from 'zod';
import { NotificationABTestService } from '../services/NotificationABTestService';

const testService = new NotificationABTestService();

const CreateTestSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  variants: z.array(
    z.object({
      variantId: z.string().min(1),
      content: z.object({
        title: z.string().min(1),
        body: z.string().min(1),
        imageUrl: z.string().optional(),
        actionUrl: z.string().optional(),
      }),
      targetPercentage: z.number().min(0).max(100),
    })
  ),
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
});

const UpdateTestSchema = CreateTestSchema.partial();

export class NotificationABTestController {
  async createTest(req: Request, res: Response): Promise<void> {
    try {
      const testData = CreateTestSchema.parse(req.body);
      const test = await testService.createTest(testData);
      res.status(201).json(test);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateTest(req: Request, res: Response): Promise<void> {
    try {
      const { testId } = req.params;
      const updateData = UpdateTestSchema.parse(req.body);
      const test = await testService.updateTest(testId, updateData);
      if (!test) {
        res.status(404).json({ error: 'Test not found' });
        return;
      }
      res.json(test);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async startTest(req: Request, res: Response): Promise<void> {
    try {
      const { testId } = req.params;
      const test = await testService.startTest(testId);
      if (!test) {
        res.status(404).json({ error: 'Test not found' });
        return;
      }
      res.json(test);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async completeTest(req: Request, res: Response): Promise<void> {
    try {
      const { testId } = req.params;
      const test = await testService.completeTest(testId);
      if (!test) {
        res.status(404).json({ error: 'Test not found' });
        return;
      }
      res.json(test);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async cancelTest(req: Request, res: Response): Promise<void> {
    try {
      const { testId } = req.params;
      const test = await testService.cancelTest(testId);
      if (!test) {
        res.status(404).json({ error: 'Test not found' });
        return;
      }
      res.json(test);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTest(req: Request, res: Response): Promise<void> {
    try {
      const { testId } = req.params;
      const test = await testService.getTest(testId);
      if (!test) {
        res.status(404).json({ error: 'Test not found' });
        return;
      }
      res.json(test);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getActiveTests(req: Request, res: Response): Promise<void> {
    try {
      const tests = await testService.getActiveTests();
      res.json(tests);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateTestMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { testId } = req.params;
      await testService.updateTestMetrics(testId);
      res.json({ message: 'Metrics updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 