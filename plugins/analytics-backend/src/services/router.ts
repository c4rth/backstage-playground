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
    analyticsService.logAnalyticsEvent(req);
    res.status(204).send();
  });

  return router;
}
