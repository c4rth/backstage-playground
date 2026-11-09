import express from 'express';
import Router from 'express-promise-router';
import { AnalyticsService } from '.';
import { HttpAuthService } from '@backstage/backend-plugin-api';

export async function createRouter({
  analyticsService,
  httpAuth,
}: {
  analyticsService: AnalyticsService;
  httpAuth: HttpAuthService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  router.post('/event', async (req, res) => {
    await analyticsService.logAnalyticsEvent(req);
    res.status(204).send();
  });

  router.post('/mcp-events', async (req, res) => {
    await httpAuth.credentials(req, { allow: ['service'] });
    const { toolName, outcome } = req.body ?? {};
    if (
      typeof toolName !== 'string' ||
      !/^[a-zA-Z0-9_.-]{1,255}$/.test(toolName) ||
      (outcome !== 'succeeded' && outcome !== 'failed')
    ) {
      res.status(400).json({ error: 'Invalid MCP analytics event' });
      return;
    }
    await analyticsService.logMcpAction(toolName, outcome);
    res.status(204).send();
  });

  router.get('/metrics/mcp-actions', async (req, res) => {
    const parsedDays = Number(req.query.days);
    if (!Number.isInteger(parsedDays) || parsedDays < 0 || parsedDays > 365) {
      res.status(400).json({ error: 'Invalid days' });
      return;
    }
    const actions = await analyticsService.getMcpActions(parsedDays);
    res.json({ actions });
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
    const features = await analyticsService.getTopFeaturesByUniqueVisitors(
      count,
      days,
    );
    res.json({ features });
  });

  return router;
}
