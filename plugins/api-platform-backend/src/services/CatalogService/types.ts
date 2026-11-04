import { Entity } from '@backstage/catalog-model';
import type { Request } from 'express';

export interface ApiPlatformCatalogService {
  registerCatalogInfo(request: {
    target: string;
    kind: string;
  }): Promise<string>;
  getEntityByName(request: {
    name: string;
    kind: string;
  }): Promise<Entity | undefined>;
  unregisterCatalogInfo(
    request: Request<{ kind: string; name: string }>,
  ): Promise<void>;
  refreshCatalogInfo(request: {
    name: string;
    kind: string;
  }): Promise<string>;
}
