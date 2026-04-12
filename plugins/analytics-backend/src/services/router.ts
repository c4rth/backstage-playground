import express from 'express';
import Router from 'express-promise-router';
import { AnalyticsService } from '.';

export async function createRouter({
  analyticsService
}: {
  analyticsService: AnalyticsService;
}): Promise<express.Router> {

  const router = Router();
  router.use(express.json());

  router.post('/event', async (req, res) => {
    await analyticsService.logAnalyticsEvent(req);
    res.status(204).send();
  });

  router.get('/metrics/daily-unique-users', async (req, res) => {
    const parsedDays = parseInt(req.query.days as string, 10);
    const days = Number.isNaN(parsedDays) ? 1 : parsedDays;
    const count = await analyticsService.getTotalDailyUniqueVisitors(days);
    res.json({ count });
  });

  router.get('/metrics/top-features', async (req, res) => {
    const parsedCount = parseInt(req.query.count as string, 10);
    const count = Number.isNaN(parsedCount) ? 10 : parsedCount;
    const parsedDays = parseInt(req.query.days as string, 10);
    const days = Number.isNaN(parsedDays) ? 1 : parsedDays;
    const features = await analyticsService.getTopFeaturesByUniqueVisitors(count, days);
    res.json({ features });
  });

  return router;
}
