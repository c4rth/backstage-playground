import express from 'express';
import Router from 'express-promise-router';
import {
  MCABASETYPE_FIELDS,
  MCACOMPONENT_FIELDS,
  McaComponentType,
} from '@internal/plugin-mca-common';
import { parseOrderByParam, parseSearchParam } from './utils';
import { McaService } from './types';

export interface RouterOptions {
  mcaService: McaService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { mcaService } = options;

  const router = Router();

  router.use(express.json());

  router.get('/mca/components', async (req, res) => {
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const orderBy = parseOrderByParam(req.query.orderBy, MCACOMPONENT_FIELDS);
    const search = parseSearchParam(req.query.search);
    const type = (req.query.type || 'all') as McaComponentType;
    const result = await mcaService.listMcaComponents({
      limit,
      offset,
      type,
      orderBy,
      search,
    });
    res.json(result);
  });

  router.get('/mca/components/:component', async (req, res) => {
    const result = await mcaService.getMcaComponent({
      component: req.params.component,
    });
    if (!result) {
      res.status(404).json({ message: 'Component not found' });
      return;
    }
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

  router.get('/mca/last-modified', async (_req, res) => {
    const result = await mcaService.getLastModifiedDate();
    if (!result) {
      res.status(404).json({ message: 'Last modified date not found' });
      return;
    }
    res.json({ lastModifiedDate: result });
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
    const result = await mcaService.listMcaBaseTypes({
      limit,
      offset,
      orderBy,
      search,
    });
    res.json(result);
  });

  router.get('/basetypes/components/:baseType', async (req, res) => {
    const result = await mcaService.getMcaBaseType({
      baseType: req.params.baseType,
    });
    if (!result) {
      res.status(404).json({ message: 'Base type not found' });
      return;
    }
    res.json(result);
  });

  return router;
}
