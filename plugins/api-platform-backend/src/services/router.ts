import express from 'express';
import Router from 'express-promise-router';
import { DatabaseApiPlatformStore } from '../database/apiPlatformStore';
import { AuthService, DatabaseService, HttpAuthService, LoggerService, UserInfoService } from '@backstage/backend-plugin-api';
import { CatalogApi } from '@backstage/catalog-client';
import { createApiService } from './ApiService';
import { createCatalogService } from './CatalogService';
import { createServiceService } from './ServiceService';
import { createSystemService } from './SystemService';
import { APIDEFINITIONS_FIELDS, LIBRARYDEFINITIONS_FIELDS, SERVICEDEFINITIONS_FIELDS, ServiceInformation, SYSTEMDEFINITIONS_FIELDS } from '@internal/plugin-api-platform-common';
import { parseOrderByParam, parseSearchParam, parseTypeParam } from './ApiService/utils';
import { RelationType } from './ApiService/types';
import { createServiceInformationService } from './ServiceInformationService';
import { createLibraryService } from './LibraryService';

async function getUserEntityRef(ownership: string, httpAuth: HttpAuthService, req: any, userInfo: UserInfoService) {
  let userEntityRef = undefined;
  if (ownership === "owned") {
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    const user = await userInfo.getUserInfo(credentials);
    userEntityRef = user.userEntityRef;
  }
  return userEntityRef;
}

export interface RouterOptions {
  logger: LoggerService;
  catalogClient: CatalogApi;
  database: DatabaseService;
  auth: AuthService;
  httpAuth: HttpAuthService;
  userInfo: UserInfoService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, catalogClient, database, auth, httpAuth, userInfo } = options;
  const router = Router();

  const apiPlatformStore = await DatabaseApiPlatformStore.create({
    database,
    skipMigrations: false,
    logger,
  });
  const apiService = await createApiService({
    logger,
    catalogClient,
    auth,
  });
  const catalogService = await createCatalogService({
    logger,
    catalogClient,
    auth,
  });
  const serviceService = await createServiceService({
    logger,
    catalogClient,
    auth
  });
  const serviceInformationService = await createServiceInformationService({
    logger,
    apiStore: apiPlatformStore,
  });
  const systemService = await createSystemService({
    logger,
    catalogClient,
    auth,
  });
  const libraryService = await createLibraryService({
    logger,
    catalogClient,
    auth,
  });

  router.use(express.json());

  // Endpoints: /apis

  router.get('/apis/definitions', async (req, res) => {
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const orderBy = parseOrderByParam(req.query.orderBy, APIDEFINITIONS_FIELDS);
    const search = parseSearchParam(req.query.search);
    const ownership = parseTypeParam(req.query.ownership) || "all";
    const userEntityRef = await getUserEntityRef(ownership, httpAuth, req, userInfo);
    res.json(await apiService.listApis({ limit, offset, orderBy, search, ownership, userEntityRef }));
  });

  router.get('/apis/count', async (req, res) => {
    const ownership = parseTypeParam(req.query.ownership) || "all";
    const userEntityRef = await getUserEntityRef(ownership, httpAuth, req, userInfo);
    res.json(await apiService.getApisCount(ownership, userEntityRef));
  });

  router.get('/apis/definitions/:system/:apiName', async (req, res) => {
    const { system, apiName } = req.params;
    res.json(await apiService.getApiVersions({ system, apiName }));
  });

  router.get('/apis/definitions/:system/:apiName/:apiVersion', async (req, res) => {
    const { system, apiName, apiVersion } = req.params;
    res.json(await apiService.getApiMatchingVersion({ system, apiName, apiVersion }));
  });

  router.get('/apis/relations/:system/:apiName', async (req, res) => {
    const { system, apiName } = req.params;
    const relationTypeParam = req.query.relationType;
    let relationType: RelationType = 'provider';
    if (relationTypeParam === "provider" || relationTypeParam === "consumer") {
      relationType = relationTypeParam as RelationType;
    }
    res.json(await apiService.getApiRelations({ system, apiName, relationType }));
  });

  // Endpoints: /catalog

  router.post('/catalog', async (req, res) => {
    res.status(201).json(await catalogService.registerCatalogInfo(req.body));
  });

  router.delete('/catalog/:kind/:name', async (req, res) => {
    const entity = await catalogService.getEntityByName({ name: req.params.name, kind: req.params.kind });
    if (entity) {
      try {
        res.status(204).json(await catalogService.unregisterCatalogInfo(entity));
      } catch (error) {
        res.status(500).json({ error: error });
      }
    } else {
      res.status(404).json();
    }
  });

  // Endpoints: /services

  router.get('/services/count', async (req, res) => {
    const ownership = parseTypeParam(req.query.ownership) || "all";
    const userEntityRef = await getUserEntityRef(ownership, httpAuth, req, userInfo);
    res.json(await serviceService.getServicesCount(ownership, userEntityRef));
  });

  router.get('/services/definitions', async (req, res) => {
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const orderBy = parseOrderByParam(req.query.orderBy, SERVICEDEFINITIONS_FIELDS);
    const search = parseSearchParam(req.query.search);
    const ownership = parseTypeParam(req.query.ownership) || "all";
    const userEntityRef = await getUserEntityRef(ownership, httpAuth, req, userInfo);
    const dependsOn = parseSearchParam(req.query.dependsOn);
    res.json(await serviceService.listServices({ limit, offset, orderBy, search, ownership, userEntityRef, dependsOn }));
  });

  router.get('/services/definitions/:system/:serviceName', async (req, res) => {
    const { system, serviceName } = req.params;
    res.json(await serviceService.getServiceVersions({ system, serviceName }));
  });

  // Exposed endpoints: /services-informations
  router.get('/service-informations/:applicationCode/:serviceName/:serviceVersion/:imageVersion', async (req, res) => {
    const { applicationCode, serviceName, serviceVersion, imageVersion } = req.params;
    const info = await serviceInformationService.getServiceInformation({
      applicationCode,
      serviceName,
      serviceVersion,
      imageVersion,
    });
    res.status(200).json(info);
  });

  router.post('/service-informations', async (req, res) => {
    const serviceInformation: ServiceInformation = req.body;
    const result = await serviceInformationService.addServiceInformation({ serviceInformation });
    res.status(201).json(result);
  });

  // Endpoints: /systems
  router.get('/systems/definitions', async (req, res) => {
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const orderBy = parseOrderByParam(req.query.orderBy, SYSTEMDEFINITIONS_FIELDS);
    const search = parseSearchParam(req.query.search);
    const ownership = parseTypeParam(req.query.ownership) || "all";
    const userEntityRef = await getUserEntityRef(ownership, httpAuth, req, userInfo);
    res.json(await systemService.listSystems({ limit, offset, orderBy, search, ownership, userEntityRef }));
  });

  router.get('/systems/count', async (req, res) => {
    const ownership = parseTypeParam(req.query.ownership) || "all";
    const userEntityRef = await getUserEntityRef(ownership, httpAuth, req, userInfo);
    res.json(await systemService.getSystemsCount(ownership, userEntityRef));
  });


  router.get('/systems/definitions/:systemName', async (req, res) => {
    res.json(await systemService.getSystem(req.params.systemName));
  });

  // Endpoints: /libraries

  router.get('/libraries/definitions', async (req, res) => {
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const orderBy = parseOrderByParam(req.query.orderBy, LIBRARYDEFINITIONS_FIELDS);
    const search = parseSearchParam(req.query.search);
    const ownership = parseTypeParam(req.query.ownership) || "all";
    const userEntityRef = await getUserEntityRef(ownership, httpAuth, req, userInfo);
    res.json(await libraryService.listLibraries({ limit, offset, orderBy, search, ownership, userEntityRef }));
  });

  router.get('/libraries/definitions/:system/:libraryName', async (req, res) => {
    const { system, libraryName } = req.params;
    const servicesCount = req.query.servicesCount === 'false' ? false : true;
    res.json(await libraryService.getLibraryVersions({ system, libraryName, servicesCount }));
  });

  return router;
}

