import express from 'express';
import Router from 'express-promise-router';
import { DatabaseApiPlatformStore } from '../database/apiPlatformStore';
import { AuthService, DatabaseService, LoggerService } from '@backstage/backend-plugin-api';
import { CatalogApi } from '@backstage/catalog-client';
import { createApiPlatformService } from './ApiPlatformService';
import { createCatalogPlatformService } from './CatalogPlatformService';
import { createServicePlatformService } from './ServicePlatformService';
import { createSystemPlatformService } from './SystemPlatformService';
import { APIDEFINITIONS_FIELDS, ServiceInformation } from '@internal/plugin-api-platform-common';
import { parseOrderByParam, parseSearchParam } from './ApiPlatformService/utils';
import { RelationType } from './ApiPlatformService/types';

export interface RouterOptions {
  logger: LoggerService;
  catalogClient: CatalogApi;
  database: DatabaseService;
  auth: AuthService;
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

  router.get('/apis/definitions', async (req, res) => {
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const orderBy = parseOrderByParam(req.query.orderBy, APIDEFINITIONS_FIELDS);
    const search = parseSearchParam(req.query.search);
    res.json(await apiPlatformService.listApis({ limit, offset, orderBy, search }));
  });

  router.get('/apis/count', async (_req, res) => {
    res.json(await apiPlatformService.getApisCount());
  });

  router.get('/apis/definitions/:system/:apiName', async (req, res) => {
    const { system, apiName } = req.params;
    res.json(await apiPlatformService.getApiVersions({ system, apiName }));
  });

  router.get('/apis/definitions/:system/:apiName/:apiVersion', async (req, res) => {
    const { system, apiName, apiVersion } = req.params;
    res.json(await apiPlatformService.getApiMatchingVersion({ system, apiName, apiVersion }));
  });

  router.get('/apis/relations/:system/:apiName', async (req, res) => {
    const { system, apiName } = req.params;
    const relationTypeParam = req.query.relationType;
    let relationType: RelationType = 'provider';
    if (relationTypeParam === "provider" || relationTypeParam === "consumer") {
      relationType = relationTypeParam as RelationType;
    }
    res.json(await apiPlatformService.getApiRelations({ system, apiName, relationType }));
  });

  // Endpoints: /catalog

  router.post('/catalog', async (req, res) => {
    res.status(201).json(await catalogPlatformService.registerCatalogInfo(req.body));
  });

  router.delete('/catalog/:kind/:name', async (req, res) => {
    const entity = await catalogPlatformService.getEntityByName({ name: req.params.name, kind: req.params.kind });
    if (entity) {
      try {
        res.status(204).json(await catalogPlatformService.unregisterCatalogInfo(entity));
      } catch (error) {
        res.status(500).json({ error: error });
      }
    } else {
      res.status(404).json();
    }
  });

  // Endpoints: /services
  router.get('/services', async (_req, res) => {
    res.json(await servicePlatformService.listServices());
  });

  router.get('/services/:system/:serviceName', async (req, res) => {
    const { system, serviceName } = req.params;
    res.json(await servicePlatformService.getServiceVersions({ system, serviceName }));
  });

  // Exposed endpoints: /services-informations
  router.get('/service-informations/:system/:serviceName/:serviceVersion/:imageVersion', async (req, res) => {
    const { system, serviceName, serviceVersion, imageVersion } = req.params;
    const info = await servicePlatformService.getServiceInformation({
      system,
      serviceName,
      serviceVersion,
      imageVersion,
    });
    res.status(200).json(info);
  });

  router.post('/service-informations', async (req, res) => {
    const serviceInformation: ServiceInformation = req.body;
    const result = await servicePlatformService.addServiceInformation({ serviceInformation });
    res.status(201).json(result);
  });

  // Endpoints: /systems
  router.get('/systems', async (_req, res) => {
    res.json(await systemPlatformService.listSystems());
  });

  router.get('/systems/:systemName', async (req, res) => {
    res.json(await systemPlatformService.getSystem({ systemName: req.params.systemName }));
  });

  return router;
}