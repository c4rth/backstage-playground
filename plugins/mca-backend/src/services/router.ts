import express from 'express';
import Router from 'express-promise-router';
import {
  MCABASETYPE_FIELDS,
  MCACOMPONENT_FIELDS,
} from '@internal/plugin-mca-common';
import {
  parseIntegerParam,
  parseMcaComponentType,
  parseOrderByParam,
  parseSearchParam,
} from './utils';
import { NotFoundError } from '@backstage/errors';

const DEFAULT_PAGE_LIMIT = 20;
const MAX_PAGE_LIMIT = 100;
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
    const offset = parseIntegerParam(
      req.query.offset,
      'offset',
      0,
      0,
      Number.MAX_SAFE_INTEGER,
    );
    const limit = parseIntegerParam(
      req.query.limit,
      'limit',
      DEFAULT_PAGE_LIMIT,
      1,
      MAX_PAGE_LIMIT,
    );
    const orderBy = parseOrderByParam(req.query.orderBy, MCACOMPONENT_FIELDS);
    const search = parseSearchParam(req.query.search);
    const type = parseMcaComponentType(req.query.type);
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
      throw new NotFoundError(`Component ${req.params.component} not found`);
    }
    res.json(result);
  });

  router.get('/mca/components/:component/definition', async (req, res) => {
    const asset = await mcaService.getMcaComponentDefinition({
      component: req.params.component,
      refP: String(req.query.refP ?? ''),
    });
    if (!asset) {
      throw new NotFoundError(
        `Component definition for ${req.params.component} not found`,
      );
    }
    res.type('application/xml');
    res.send(asset);
  });

  router.get('/mca/count', async (req, res) => {
    const type = parseMcaComponentType(req.query.type);
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
      throw new NotFoundError('Last modified date not found');
    }
    res.json({ lastModifiedDate: result });
  });

  router.get('/basetypes/count', async (_req, res) => {
    const result = await mcaService.getMcaBaseTypesCount();
    res.json(result);
  });

  router.get('/basetypes/components', async (req, res) => {
    const offset = parseIntegerParam(
      req.query.offset,
      'offset',
      0,
      0,
      Number.MAX_SAFE_INTEGER,
    );
    const limit = parseIntegerParam(
      req.query.limit,
      'limit',
      DEFAULT_PAGE_LIMIT,
      1,
      MAX_PAGE_LIMIT,
    );
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
      throw new NotFoundError(`Base type ${req.params.baseType} not found`);
    }
    res.json(result);
  });

  router.get('/basetypes/javadoc/assets', async (req, res) => {
    const asset = await mcaService.getMcaBaseTypeJavadocAsset({
      path: String(req.query.path ?? ''),
    });
    if (asset.contentType) res.type(asset.contentType);
    res.send(asset.content);
  });

  router.get('/basetypes/javadoc/:baseType', async (req, res) => {
    const javadoc = await mcaService.getMcaBaseTypeJavadoc({
      baseType: req.params.baseType,
      packageName: String(req.query.packageName ?? ''),
    });
    res.removeHeader('X-Frame-Options');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    );
    res.type('html').send(javadoc);
  });

  return router;
}
