import express from 'express';
import Router from 'express-promise-router';
import { DatabaseMcaComponentsStore } from '../database/mcaComponentStore';
import { DatabaseService, LoggerService } from '@backstage/backend-plugin-api';
import { MCACOMPONENT_FIELDS, McaComponentType } from '@internal/plugin-mca-components-common';
import { createMcaService } from './McaService';
import { parseOrderByParam, parseSearchParam } from './utils';

export interface RouterOptions {
  logger: LoggerService;
  database: DatabaseService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, database } = options;
  const router = Router();

  const mcaComponentsStore = await DatabaseMcaComponentsStore.create({
    database,
    skipMigrations: false,
    logger,
  });
  const mcaService = await createMcaService({
    logger,
    mcaComponentsStore,
  });

  router.use(express.json());

  // Enpoints: /mca

  router.get('/mca/components', async (req, res) => {
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const orderBy = parseOrderByParam(req.query.orderBy, MCACOMPONENT_FIELDS);
    const search = parseSearchParam(req.query.search);
    const type = req.query.type as McaComponentType;
    res.json(await mcaService.listMcaComponents({ limit, offset, type, orderBy, search }));
  });

  router.get('/mca/components/:component', async (req, res) => {
    res.json(await mcaService.getMcaComponent({ component: req.params.component }));
  });

  router.get('/mca/count', async (req, res) => {    
    const type = req.query.type as McaComponentType;
    res.json(await mcaService.getMcaComponentsCount({type}));
  });

  return router;
}