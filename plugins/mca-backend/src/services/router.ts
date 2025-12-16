import express from 'express';
import Router from 'express-promise-router';
import { DatabaseMcaComponentsStore } from '../database/mcaComponentStore';
import { DatabaseService, LoggerService, SchedulerService } from '@backstage/backend-plugin-api';
import { MCABASETYPE_FIELDS, MCACOMPONENT_FIELDS, McaComponentType } from '@internal/plugin-mca-common';
import { createMcaService } from './McaService';
import { parseOrderByParam, parseSearchParam } from './utils';
import { Config } from '@backstage/config';

export interface RouterOptions {
  logger: LoggerService;
  database: DatabaseService;
  scheduler: SchedulerService;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, database, scheduler, config } = options;
  const router = Router();

  const mcaComponentsStore = await DatabaseMcaComponentsStore.create({
    database,
    skipMigrations: false,
    logger,
  });
  const mcaService = await createMcaService({
    logger,
    mcaComponentsStore,
    scheduler,
    config,
  });

  router.use(express.json());

  // Enpoints: /mca

  router.get('/mca/components', async (req, res) => {
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const orderBy = parseOrderByParam(req.query.orderBy, MCACOMPONENT_FIELDS);
    const search = parseSearchParam(req.query.search);
    const type = (req.query.type || 'all') as McaComponentType;
    const result = await mcaService.listMcaComponents({ limit, offset, type, orderBy, search });
    res.json(result);
  });

  router.get('/mca/components/:component', async (req, res) => {
    const result = await mcaService.getMcaComponent({ component: req.params.component });
    res.json(result);
  });

  router.get('/mca/count', async (req, res) => {
    const type = req.query.type as McaComponentType;
    const result = await mcaService.getMcaComponentsCount({ type });
    res.json(result);
  });

  router.get('/mca/versions', async (_req, res) => {
    const result = await mcaService.getMcaVersions();
    res.json(result);
  });

  router.get('/basetypes/count', async (_req, res) => {
    const result = await mcaService.getMcaBaseTypesCount();
    res.json(result);
  });

  router.get('/basetypes/components', async (req, res) => {
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const orderBy = parseOrderByParam(req.query.orderBy, MCABASETYPE_FIELDS);
    const search = parseSearchParam(req.query.search);
    const result = await mcaService.listMcaBaseTypes({ limit, offset, orderBy, search });
    res.json(result);
  });

  router.get('/basetypes/components/:baseType', async (req, res) => {
    const result = await mcaService.getMcaBaseType({ baseType: req.params.baseType });
    res.json(result);
  });

  router.post('/mca/schedule-task', async (req, res) => {
    const type = (req.query.type || 'component') as 'component' | 'basetype';
    if (type === 'component') {
      mcaService.scheduleMcaComponentTask();
    } else {
      mcaService.scheduleMcaComponentTask();
    }
    res.status(204).end();
  });

  return router;
}