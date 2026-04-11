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

  router.get('/metrics/daily-unique-users', async (_, res) => {
    const count = await analyticsService.getTotalDailyUniqueVisitors();
    res.json({ count });
  });

  router.get('/metrics/top-features', async (_, res) => {
    const features = await analyticsService.getTopFeaturesByUniqueVisitors();
    res.json({ features });
  });

  return router;
}
