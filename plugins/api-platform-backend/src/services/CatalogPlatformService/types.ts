
export interface CatalogPlatformService {
  registerCatalogInfo(request: { target: string, kind: string }): Promise<String>;
}
