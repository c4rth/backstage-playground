import { ComponentEntity, Entity, parseEntityRef, RELATION_DEPENDENCY_OF } from "@backstage/catalog-model";
import { CatalogApi } from "@backstage/plugin-catalog-react";
import {
  ANNOTATION_LIBRARY_VERSION,
  CATALOG_METADATA_IMAGE_VERSION,
  CATALOG_METADATA_SERVICE_NAME,
  CATALOG_METADATA_SERVICE_VERSION,
  CATALOG_SPEC_LIFECYCLE,
  CATALOG_SPEC_SYSTEM
} from "@internal/plugin-api-platform-common";
import { ApiPlatformBackendApi } from "../../api/ApiPlatformBackendApi";

const fetchServiceEntities = async (
  catalogApi: CatalogApi,
  libEntity: Entity,
): Promise<Entity[]> => {
  const relations = libEntity.relations?.filter(relation => relation.type === RELATION_DEPENDENCY_OF) ?? [];
  if (relations.length === 0) {
    return [];
  }
  const targetNames = relations.map(relation => parseEntityRef(relation.targetRef).name);

  const response = await catalogApi.getEntities({
    fields: [
      CATALOG_METADATA_SERVICE_NAME,
      CATALOG_METADATA_SERVICE_VERSION,
      CATALOG_METADATA_IMAGE_VERSION,
      CATALOG_SPEC_LIFECYCLE,
      CATALOG_SPEC_SYSTEM,
    ],
    filter: {
      kind: ['Component'],
      'spec.type': ['service'],
      'metadata.name': targetNames,
    },
  });

  return response.items;
};

export const fetchServicesByLibrary = async (
  catalogApi: CatalogApi,
  libraryEntity: ComponentEntity,
): Promise<Entity[]> => {
  const servicePromises = libraryEntity.metadata[ANNOTATION_LIBRARY_VERSION]
    ? [libraryEntity].map(async libEntity => {
      try {
        return await fetchServiceEntities(catalogApi, libEntity);
      } catch {
        // Continue even if one fails
        return [];
      }
    })
    : [];

  const serviceArrays = await Promise.all(servicePromises);
  return serviceArrays.flat();
}

export const fetchAllServices = async (
    apiPlatformApi: ApiPlatformBackendApi,
) => {
    const result = await apiPlatformApi.listServices({
        ownership: 'all',
    });
    return result ?? [];
};