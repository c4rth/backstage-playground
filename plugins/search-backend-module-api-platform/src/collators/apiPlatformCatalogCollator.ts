import { Entity, isApiEntity, isComponentEntity, isSystemEntity } from '@backstage/catalog-model';
import { CatalogCollatorEntityTransformer, defaultCatalogCollatorEntityTransformer } from '@backstage/plugin-search-backend-module-catalog';
import {
    ANNOTATION_API_NAME,
    ANNOTATION_API_VERSION,
    ANNOTATION_IMAGE_VERSION,
    ANNOTATION_SERVICE_NAME,
    ANNOTATION_SERVICE_PLATFORM,
    ANNOTATION_SERVICE_VERSION
} from '@internal/plugin-api-platform-common';
import { parse } from 'yaml';

type EntityType = 'api' | 'service' | 'system';

interface EntityInfo {
    type: EntityType;
    kind: string;
    title: string;
    text: string;
    location: string;
    lifecycle: string;
}

const BASE_LOCATION = '/api-platform/';
const DEFAULT_PLATFORM = 'cloud';
const DEFAULT_NAMESPACE = 'default';

const getEntityTypeInfo = (entity: Entity): EntityInfo | null => {

    if (isApiEntity(entity)) {
        const apiName = entity.metadata[ANNOTATION_API_NAME];
        const apiVersion = entity.metadata[ANNOTATION_API_VERSION];

        if (!apiName || !apiVersion) {
            return null; // Skip entities with missing required annotations
        }
        const description = entity.metadata.description ?? '';
        let definition = '';
        if (entity.spec?.definition) {
            try {
                const openApi = parse(entity.spec.definition);
                definition = openApi?.info?.description ?? 'NO DESCRIPTION';
            } catch (error) {
                //                
            }
        }

        return {
            type: 'api',
            kind: 'OpenAPI',
            title: `${apiName} ${apiVersion}`,
            text: `Description: ${description} - Definition: ${definition}`,
            location: `${BASE_LOCATION}api/${apiName}?version=${apiVersion}`,
            lifecycle: (entity.spec?.lifecycle as string) ?? '',
        };
    }

    if (isSystemEntity(entity)) {
        return {
            type: 'system',
            kind: 'System',
            title: `System ${entity.metadata.name}`,
            text: `System: ${entity.metadata.name}`,
            location: `${BASE_LOCATION}system/${entity.metadata.name}`,
            lifecycle: '',
        };
    }

    if (isComponentEntity(entity) && entity.spec?.type === 'service') {
        const serviceName = entity.metadata[ANNOTATION_SERVICE_NAME];
        const serviceVersion = entity.metadata[ANNOTATION_SERVICE_VERSION];
        const lifecycle = entity.spec?.lifecycle as string ?? '';

        if (!serviceName || !serviceVersion) {
            return null; // Skip entities with missing required annotations
        }

        const description = entity.metadata.description ?? '';
        const imageVersion = entity.metadata[ANNOTATION_IMAGE_VERSION] ?? 'n/a';
        const platform = entity.metadata[ANNOTATION_SERVICE_PLATFORM] ?? DEFAULT_PLATFORM;

        return {
            type: 'service',
            kind: 'Service',
            title: `${serviceName} v${serviceVersion} in ${lifecycle}`,
            text: `${description} - Version: ${imageVersion} - Platform: ${platform}`,
            location: `${BASE_LOCATION}service/${serviceName}?version=${serviceVersion}&env=${lifecycle}`,
            lifecycle,
        };
    }

    return null;
};

export const apiPlatformCatalogCollatorEntityTransformer: CatalogCollatorEntityTransformer =
    (entity: Entity) => {
        try {
            const entityInfo = getEntityTypeInfo(entity);

            if (!entityInfo) {
                return defaultCatalogCollatorEntityTransformer(entity);
            }

            return {
                title: entityInfo.title,
                text: entityInfo.text,
                componentType: entity.spec?.type?.toString() ?? 'other',
                type: `api-platform.${entityInfo.type}`,
                namespace: entity.metadata.namespace ?? DEFAULT_NAMESPACE,
                kind: entityInfo.kind,
                lifecycle: entityInfo.lifecycle,
                owner: (entity.spec?.owner as string) ?? '',
                apiPlatformLocation: entityInfo.location,
            };
        } catch (error) {
            return defaultCatalogCollatorEntityTransformer(entity);
        }
    };