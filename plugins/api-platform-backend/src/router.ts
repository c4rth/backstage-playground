import express from 'express';
import { Request } from 'express';
import Router from 'express-promise-router';
import { InputError } from '@backstage/errors';
import lodash from 'lodash';
import { ApiPlatformService } from './services/ApiPlatformService/types';
import { CatalogPlatformService } from './services/CatalogPlatformService/types';
import { ServicePlatformService } from './services/ServicePlatformService/types';

export interface RouterOptions {
  apiPlatformService: ApiPlatformService;
  catalogPlatformService: CatalogPlatformService;
  servicePlatformService: ServicePlatformService;
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
  const { apiPlatformService, catalogPlatformService, servicePlatformService } = options;
  const router = Router();
  router.use(express.json());

  router.get('/apis', async (_req, res) => {
    res.json(await apiPlatformService.listApis());
  });

  router.get('/apis/:apiName', async (req, res) => {
    res.json(await apiPlatformService.getApiVersions({ apiName: req.params.apiName }));
  });

  router.get('/apis/:apiName/:apiVersion', async (req, res) => {
    res.json(await apiPlatformService.getApiMatchingVersion({ apiName: req.params.apiName, apiVersion: req.params.apiVersion }));
  });

  router.post('/locations', async (req, res) => {
    console.log(" locations");
    validateRequestBody(req);
    const target: string = req.body.target;
    if (!target) {
      throw new InputError('Invalid request body');
    }
    res.status(201).json(await catalogPlatformService.registerCatalogInfo({target: target}));
  });

  router.get('/services', async (_req, res) => {
    res.json(await servicePlatformService.listServices());
  });

  router.get('/services/:serviceName', async (req, res) => {
    res.json(await servicePlatformService.getServiceVersions({ serviceName: req.params.serviceName }));
  });

  return router;
}
