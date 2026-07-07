import { Entity } from '@backstage/catalog-model';

export type UnregisterResponse = {
  message: string;
  returnCode: number;
};

export type RefreshResponse = {
  message: string;
  returnCode: number;
};

export interface ApiPlatformCatalogService {
  registerCatalogInfo(request: {
    target: string;
    kind: string;
  }): Promise<String>;
  getEntityByName(request: {
    name: string;
    kind: string;
  }): Promise<Entity | undefined>;
  unregisterCatalogInfo(request: {
    name: string;
    kind: string;
  }): Promise<UnregisterResponse>;
  refreshCatalogInfo(request: {
    name: string;
    kind: string;
  }): Promise<RefreshResponse>;
}
