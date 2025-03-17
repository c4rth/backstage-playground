import { Entity, isApiEntity, isComponentEntity, isSystemEntity } from '@backstage/catalog-model';
import { CatalogCollatorEntityTransformer, defaultCatalogCollatorEntityTransformer } from '@backstage/plugin-search-backend-module-catalog';
import { ANNOTATION_API_NAME, ANNOTATION_API_VERSION, ANNOTATION_IMAGE_VERSION, ANNOTATION_SERVICE_NAME, ANNOTATION_SERVICE_PLATFORM, ANNOTATION_SERVICE_VERSION } from '@internal/plugin-api-platform-common';

const getDocumentTitle = (entity: Entity): string => {
    const title: string[] = [];
    if (isApiEntity(entity)) {
        title.push(`${entity.metadata[ANNOTATION_API_NAME]}`);
        title.push(`${entity.metadata[ANNOTATION_API_VERSION]}`);
    } else if (isSystemEntity(entity)) {
        title.push('System');
        title.push(`${entity.metadata.name}`);
    } else {
        title.push(`${entity.metadata[ANNOTATION_SERVICE_NAME]}`);
        title.push(`v${entity.metadata[ANNOTATION_SERVICE_VERSION]}`);
        title.push(`in ${entity.spec?.lifecycle}`);
    }
    return title.join(' ');
};

const getDocumentText = (entity: Entity): string => {
    const text: string[] = [];
    if (isApiEntity(entity)) {
        text.push(entity.metadata.description || '');
        text.push(entity.spec.definition);
    } else if (isSystemEntity(entity)) {
        text.push(`System: ${entity.metadata.name}`);
    } else {
        text.push(entity.metadata.description || '');
        text.push(`Image: ${entity.metadata[ANNOTATION_IMAGE_VERSION]}`);
        text.push(`Platform: ${entity.metadata[ANNOTATION_SERVICE_PLATFORM] || 'azure'}`);
    }
    return text.join(',');
};

export const apiPlatformCatalogCollatorEntityTransformer: CatalogCollatorEntityTransformer =
    (entity: Entity) => {
        const isService = isComponentEntity(entity) && entity.spec?.type === 'service';
        if (isApiEntity(entity) || isService || isSystemEntity(entity)) {
            let type = '';
            let location = '/api-platform/';
            let kind = '';
            if (isApiEntity(entity)) {
                type = 'api';
                location += `api/${entity.metadata[ANNOTATION_API_NAME]}?version=${entity.metadata[ANNOTATION_API_VERSION]}`;
                kind = 'OpenAPI';
            } else if (isService) {
                type = 'service';
                location += `service/${entity.metadata[ANNOTATION_SERVICE_NAME]}?version=${entity.metadata[ANNOTATION_SERVICE_VERSION]}&env=${entity.spec.lifecycle}`;
                kind = 'Service';
            } else {
                type = 'system';
                location += `system/${entity.metadata.name}`;
                kind = 'System';
            }
            return {
                title: getDocumentTitle(entity),
                text: getDocumentText(entity),
                componentType: entity.spec?.type?.toString() || 'other',
                type: `api-platform.${type}`,
                namespace: entity.metadata.namespace || 'default',
                kind: kind,
                lifecycle: isSystemEntity(entity) ? '' : (entity.spec?.lifecycle as string) || '',
                owner: (entity.spec?.owner as string) || '',
                apiPlatformLocation: location,
            };
        }
        return defaultCatalogCollatorEntityTransformer(entity);
    };