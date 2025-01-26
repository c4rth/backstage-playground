
export interface CatalogPlatformService {
  registerCatalogInfo(location: { target: string }): Promise<String>;
}
