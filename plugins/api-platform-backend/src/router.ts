import express from 'express';
import { Request } from 'express';
import Router from 'express-promise-router';
import { InputError } from '@backstage/errors';
import lodash from 'lodash';
import { DatabaseApiPlatformStore } from './database/apiPlatformStore';
import { AuthService, DatabaseService, LoggerService } from '@backstage/backend-plugin-api/index';
import { CatalogApi } from '@backstage/catalog-client/index';
import { createApiPlatformService } from './services/ApiPlatformService';
import { createCatalogPlatformService } from './services/CatalogPlatformService';
import { createServicePlatformService } from './services/ServicePlatformService';
import { createSystemPlatformService } from './services/SystemPlatformService';

export interface RouterOptions {
  logger: LoggerService;  
  catalogClient: CatalogApi;
  database: DatabaseService;
  auth: AuthService;
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
  const { logger, catalogClient, database, auth } = options;
  const router = Router();

  const apiPlatformStore = await DatabaseApiPlatformStore.create({
    database,
    skipMigrations: false,
    logger,
  });
  const apiPlatformService = await createApiPlatformService({
    logger,
    catalogClient,
    auth,
  });
  const catalogPlatformService = await createCatalogPlatformService({
    logger,
    catalogClient,
    auth,
  });
  const servicePlatformService = await createServicePlatformService({
    logger,
    catalogClient,
    apiPlatformStore,
    auth
  });
  const systemPlatformService = await createSystemPlatformService({
    logger,
    catalogClient,
    auth
  });

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

  router.get('/services/:serviceName/:serviceVersion/:containerVersion', async (req, res) => {
    res.json(await servicePlatformService.getServiceApis({
      serviceName: req.params.serviceName,
      serviceVersion: req.params.serviceVersion,
      containerVersion: req.params.containerVersion,
    }));
  });

  router.post('/services/:serviceName/:serviceVersion/:containerVersion', async (req, res) => {
    const apis = req.body;
    res.json(await servicePlatformService.addServiceApis({
      serviceName: req.params.serviceName,
      serviceVersion: req.params.serviceVersion,
      containerVersion: req.params.containerVersion,
      consumedApis: apis,
      providedApis: apis
    }));
  });

  router.get('/systems', async (_req, res) => {
    res.json(await systemPlatformService.listSystems());
  });

  router.get('/systems/:systemName', async (req, res) => {
    res.json(await systemPlatformService.getSystem({ systemName: req.params.systemName }));
  });

  return router;
}
