import { Entity } from "@backstage/catalog-model";

export interface ApiPlatformCatalogService {
  registerCatalogInfo(request: { target: string, kind: string }): Promise<String>;
  getEntityByName(request: { name: string, kind: string }): Promise<Entity | undefined>;
  unregisterCatalogInfo(entity: Entity): Promise<String>;
}
