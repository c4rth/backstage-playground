import express from 'express';
import Router from 'express-promise-router';
import {
  HttpAuthService,
  UserInfoService,
} from '@backstage/backend-plugin-api';
import { ApiService } from './ApiService';
import { ApiPlatformCatalogService } from './CatalogService';
import { ServiceService } from './ServiceService';
import { SystemService } from './SystemService';
import {
  APIDEFINITIONS_FIELDS,
  LIBRARYDEFINITIONS_FIELDS,
  SERVICEDEFINITIONS_FIELDS,
  ServiceInformation,
  SYSTEMDEFINITIONS_FIELDS,
  ApiRelationType,
} from '@internal/plugin-api-platform-common';
import {
  parseOrderByParam,
  parseSearchParam,
  parseOwnershipParam,
  parseApiTypeParam,
  parseDependentsParam,
  parseIntegerParam,
} from './ApiService/utils';
import { InputError, NotFoundError } from '@backstage/errors';
import { LibraryService } from './LibraryService';
import { ServiceInformationService } from './ServiceInformationService';

async function getUserEntityRef(
  ownershipType: string,
  httpAuth: HttpAuthService,
  req: any,
  userInfo: UserInfoService,
) {
  let userEntityRef = undefined;
  if (ownershipType === 'owned') {
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    const user = await userInfo.getUserInfo(credentials);
    userEntityRef = user.userEntityRef;
  }
  return userEntityRef;
}

export interface RouterOptions {
  httpAuth: HttpAuthService;
  userInfo: UserInfoService;
  serviceInformationService: ServiceInformationService;
  systemService: SystemService;
  serviceService: ServiceService;
  apiService: ApiService;
  libraryService: LibraryService;
  apiPlatformCatalogService: ApiPlatformCatalogService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const {
    httpAuth,
    userInfo,
    serviceInformationService,
    systemService,
    serviceService,
    apiService,
    libraryService,
    apiPlatformCatalogService,
  } = options;

  const router = Router();
  router.use(express.json());

  // Endpoints: /apis

  router.get('/apis/definitions', async (req, res) => {
    const offset = parseIntegerParam(req.query.offset, 'offset', 0);
    const limit = parseIntegerParam(req.query.limit, 'limit', 20);
    const orderBy = parseOrderByParam(req.query.orderBy, APIDEFINITIONS_FIELDS);
    const search = parseSearchParam(req.query.search);
    const ownershipType = parseOwnershipParam(req.query.ownershipType) || 'all';
    const apiType = parseApiTypeParam(req.query.apiType) || 'all';
    const userEntityRef = await getUserEntityRef(
      ownershipType,
      httpAuth,
      req,
      userInfo,
    );
    res.json(
      await apiService.listApis({
        limit,
        offset,
        orderBy,
        search,
        ownershipType,
        apiType,
        userEntityRef,
      }),
    );
  });

  router.get('/apis/count', async (req, res) => {
    const ownershipType = parseOwnershipParam(req.query.ownershipType) || 'all';
    const apiType = parseApiTypeParam(req.query.apiType) || 'all';
    const userEntityRef = await getUserEntityRef(
      ownershipType,
      httpAuth,
      req,
      userInfo,
    );
    res.json(
      await apiService.getApisCount(ownershipType, apiType, userEntityRef),
    );
  });

  router.get('/apis/definitions/:system/:apiName', async (req, res) => {
    const { system, apiName } = req.params;
    res.json(await apiService.getApiVersions({ system, apiName }));
  });

  router.get(
    '/apis/definitions/:system/:apiName/:apiVersion',
    async (req, res) => {
      const { system, apiName, apiVersion } = req.params;
      const api = await apiService.getApiMatchingVersion({
        system,
        apiName,
        apiVersion,
      });
      if (!api) {
        throw new NotFoundError(
          `API ${apiName} version ${apiVersion} not found`,
        );
      }
      res.json(api);
    },
  );

  router.get('/apis/relations/:system/:apiName', async (req, res) => {
    const { system, apiName } = req.params;
    const relationTypeParam = req.query.relationType;
    let relationType: ApiRelationType = 'provider';
    if (relationTypeParam !== undefined) {
      if (
        relationTypeParam !== 'provider' &&
        relationTypeParam !== 'consumer'
      ) {
        throw new InputError(
          "relationType must be either 'provider' or 'consumer'",
        );
      }
      relationType = relationTypeParam;
    }
    res.json(
      await apiService.getApiRelations({ system, apiName, relationType }),
    );
  });

  // Endpoints: /catalog

  router.post('/catalog', async (req, res) => {
    res
      .status(201)
      .json(await apiPlatformCatalogService.registerCatalogInfo(req.body));
  });

  router.delete('/catalog/:kind/:name', async (req, res) => {
    await apiPlatformCatalogService.unregisterCatalogInfo(req);
    res.status(204).end();
  });

  router.patch('/catalog/:kind/:name', async (req, res) => {
    const message = await apiPlatformCatalogService.refreshCatalogInfo({
      name: req.params.name,
      kind: req.params.kind,
    });
    res.status(200).json({ message });
  });

  // Endpoints: /services

  router.get('/services/count', async (req, res) => {
    const ownershipType = parseOwnershipParam(req.query.ownershipType) || 'all';
    const userEntityRef = await getUserEntityRef(
      ownershipType,
      httpAuth,
      req,
      userInfo,
    );
    res.json(
      await serviceService.getServicesCount(ownershipType, userEntityRef),
    );
  });

  router.get('/services/definitions', async (req, res) => {
    const offset = parseIntegerParam(req.query.offset, 'offset', 0);
    const limit = parseIntegerParam(req.query.limit, 'limit');
    const orderBy = parseOrderByParam(
      req.query.orderBy,
      SERVICEDEFINITIONS_FIELDS,
    );
    const search = parseSearchParam(req.query.search);
    const ownershipType = parseOwnershipParam(req.query.ownershipType) || 'all';
    const userEntityRef = await getUserEntityRef(
      ownershipType,
      httpAuth,
      req,
      userInfo,
    );
    const dependsOn = parseSearchParam(req.query.dependsOn);
    const dependentsType = parseDependentsParam(req.query.dependentsType);
    res.json(
      await serviceService.listServices({
        limit,
        offset,
        orderBy,
        search,
        ownershipType,
        userEntityRef,
        dependsOn,
        dependentsType,
      }),
    );
  });

  router.get('/services/definitions/:system/:serviceName', async (req, res) => {
    const { system, serviceName } = req.params;
    res.json(await serviceService.getServiceVersions({ system, serviceName }));
  });

  // Exposed endpoints: /services-informations
  router.get(
    '/service-informations/:applicationCode/:serviceName/:serviceVersion/:imageVersion',
    async (req, res) => {
      const { applicationCode, serviceName, serviceVersion, imageVersion } =
        req.params;
      const info = await serviceInformationService.getServiceInformation({
        applicationCode,
        serviceName,
        serviceVersion,
        imageVersion,
      });
      res.status(200).json(info);
    },
  );

  router.post('/service-informations', async (req, res) => {
    const serviceInformation: ServiceInformation = req.body;
    const result = await serviceInformationService.addServiceInformation({
      serviceInformation,
    });
    res.status(201).json(result);
  });

  // Endpoints: /systems
  router.get('/systems/definitions', async (req, res) => {
    const offset = parseIntegerParam(req.query.offset, 'offset', 0);
    const limit = parseIntegerParam(req.query.limit, 'limit', 20);
    const orderBy = parseOrderByParam(
      req.query.orderBy,
      SYSTEMDEFINITIONS_FIELDS,
    );
    const search = parseSearchParam(req.query.search);
    const ownershipType = parseOwnershipParam(req.query.ownershipType) || 'all';
    const userEntityRef = await getUserEntityRef(
      ownershipType,
      httpAuth,
      req,
      userInfo,
    );
    res.json(
      await systemService.listSystems({
        limit,
        offset,
        orderBy,
        search,
        ownershipType,
        userEntityRef,
      }),
    );
  });

  router.get('/systems/count', async (req, res) => {
    const ownershipType = parseOwnershipParam(req.query.ownershipType) || 'all';
    const userEntityRef = await getUserEntityRef(
      ownershipType,
      httpAuth,
      req,
      userInfo,
    );
    res.json(await systemService.getSystemsCount(ownershipType, userEntityRef));
  });

  router.get('/systems/definitions/:systemName', async (req, res) => {
    res.json(await systemService.getSystem(req.params.systemName));
  });

  // Endpoints: /libraries

  router.get('/libraries/definitions', async (req, res) => {
    const offset = parseIntegerParam(req.query.offset, 'offset', 0);
    const limit = parseIntegerParam(req.query.limit, 'limit', 20);
    const orderBy = parseOrderByParam(
      req.query.orderBy,
      LIBRARYDEFINITIONS_FIELDS,
    );
    const search = parseSearchParam(req.query.search);
    const ownershipType = parseOwnershipParam(req.query.ownershipType) || 'all';
    const userEntityRef = await getUserEntityRef(
      ownershipType,
      httpAuth,
      req,
      userInfo,
    );
    res.json(
      await libraryService.listLibraries({
        limit,
        offset,
        orderBy,
        search,
        ownershipType,
        userEntityRef,
      }),
    );
  });

  router.get(
    '/libraries/definitions/:system/:libraryName',
    async (req, res) => {
      const { system, libraryName } = req.params;
      const servicesCountParam = req.query.servicesCount;
      if (
        servicesCountParam !== undefined &&
        servicesCountParam !== 'true' &&
        servicesCountParam !== 'false'
      ) {
        throw new InputError("servicesCount must be either 'true' or 'false'");
      }
      const servicesCount = servicesCountParam !== 'false';
      res.json(
        await libraryService.getLibraryVersions({
          system,
          libraryName,
          servicesCount,
        }),
      );
    },
  );

  return router;
}
