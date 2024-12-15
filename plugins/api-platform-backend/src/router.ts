import express from 'express';
import Router from 'express-promise-router';
import { ApiDefinitionService } from './services/ApiDefinitionService/types';

export interface RouterOptions {
  apiDefinitionService: ApiDefinitionService;
}


export async function createRouter(
  options: RouterOptions,
):  Promise<express.Router> {
  const { apiDefinitionService } = options;
  const router = Router();
  router.use(express.json());

  router.get('/', async (_req, res) => {
    res.json(await apiDefinitionService.listApiDefinitions());
  });

  router.get('/:id', async (req, res) => {
    res.json(await apiDefinitionService.getApiDefinitionVersions({ id: req.params.id }));
  });

  return router;
}
