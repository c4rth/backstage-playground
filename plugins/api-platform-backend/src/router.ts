import express from 'express';
import { Request } from 'express';
import Router from 'express-promise-router';
import { ApiDefinitionService } from './services/ApiDefinitionService/types';
import { InputError } from '@backstage/errors';
import lodash from 'lodash';

export interface RouterOptions {
  apiDefinitionService: ApiDefinitionService;
}

function validateRequestBody(req: Request) {
  const body = req.body;
  if (!body) {
    throw new InputError('Missing request body');
  } else if (!lodash.isPlainObject(body)) {
    throw new InputError('Expected body to be a JSON object');
  } else if (Object.keys(body).length === 0) {
    // Because of how express.json() translates the empty body to {}
    throw new InputError('Empty request body');
  }
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { apiDefinitionService } = options;
  const router = Router();
  router.use(express.json());

  router.get('/', async (_req, res) => {
    res.json(await apiDefinitionService.listApiDefinitions());
  });

  router.get('/:id', async (req, res) => {
    res.json(await apiDefinitionService.getApiDefinitionVersions({ id: req.params.id }));
  });

  router.post('/location', async (req, res) => {
    console.log(" locations");
    validateRequestBody(req);
    const target: string = req.body.target;
    if (!target) {
      throw new InputError('Invalid request body');
    }
    res.status(201).json(await apiDefinitionService.registerCatalogInfo({target: target}));
  });

  return router;
}
