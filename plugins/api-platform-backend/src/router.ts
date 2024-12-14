import express from 'express';
import Router from 'express-promise-router';
import { ApiDefinitionService } from './services/ApiDefinitionService/types';

export async function createRouter({
  apiDefinitionService,
}: {
  apiDefinitionService: ApiDefinitionService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  router.get('/', async (_req, res) => {
    res.json(await apiDefinitionService.listApiDefinitions());
  });

  router.get('/:id', async (req, res) => {
    res.json(await apiDefinitionService.getApiDefinition({ id: req.params.id }));
  });

  return router;
}
