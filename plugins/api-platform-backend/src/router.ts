import express from 'express';
import { Request } from 'express';
import Router from 'express-promise-router';
import { InputError } from '@backstage/errors';
import lodash from 'lodash';
import { DatabaseApiPlatformStore } from './database/apiPlatformStore';
import { AuthService, DatabaseService, LoggerService } from '@backstage/backend-plugin-api';
import { CatalogApi } from '@backstage/catalog-client';
import { createApiPlatformService } from './services/ApiPlatformService';
import { createCatalogPlatformService } from './services/CatalogPlatformService';
import { createServicePlatformService } from './services/ServicePlatformService';
import { createSystemPlatformService } from './services/SystemPlatformService';
import { ServiceInformation } from '@internal/plugin-api-platform-common';
 
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
 
  // Endpoints: /apis
 
  router.get('/apis', async (_req, res) => {
    res.json(await apiPlatformService.listApis());
  });
 
  router.get('/apis/:apiName', async (req, res) => {
    res.json(await apiPlatformService.getApiVersions({ apiName: req.params.apiName }));
  });
 
  router.get('/apis/:apiName/:apiVersion', async (req, res) => {
    res.json(await apiPlatformService.getApiMatchingVersion({ apiName: req.params.apiName, apiVersion: req.params.apiVersion }));
  });
 
  // Endpoints: /catalog
 
  router.post('/catalog', async (req, res) => {
    validateRequestBody(req);
    const target = req.body;
    if (!target) {
      throw new InputError('Invalid request body');
    }
    res.status(201).json(await catalogPlatformService.registerCatalogInfo(target));
  });
 
  // Endpoints: /services
 
  router.get('/services', async (_req, res) => {
    res.json(await servicePlatformService.listServices());
  });
 
  router.get('/services/:serviceName', async (req, res) => {
    res.json(await servicePlatformService.getServiceVersions({ serviceName: req.params.serviceName }));
  });
 
  // Exposed endpoints: /services
 
  router.get('/service-informations/:applicationCode/:serviceName/:serviceVersion/:imageVersion', async (req, res) => {
    const info = await servicePlatformService.getServiceInformation({
      applicationCode: req.params.applicationCode,
      serviceName: req.params.serviceName,
      serviceVersion: req.params.serviceVersion,
      imageVersion: req.params.imageVersion,
    });
    if (info) {
      res.json(info);
    } else {
      res.status(404).json();
    }
  });
 
  router.post('/service-informations', async (req, res) => {
    const serviceInformation: ServiceInformation = req.body;
    logger.info("POST service-informations", serviceInformation);
    res.status(201).json(await servicePlatformService.addServiceInformation({ serviceInformation }));
  });
 
  // Endpoints: /systems
 
  router.get('/systems', async (_req, res) => {
    res.json(await systemPlatformService.listSystems());
  });
 
  router.get('/systems/:systemName', async (req, res) => {
    res.json(await systemPlatformService.getSystem({ systemName: req.params.systemName }));
  });
 
  //
 
  return router;
}