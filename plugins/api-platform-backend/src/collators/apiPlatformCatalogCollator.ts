import { Entity, isApiEntity, isComponentEntity } from '@backstage/catalog-model';
import { CatalogCollatorEntityTransformer, defaultCatalogCollatorEntityTransformer } from '@backstage/plugin-search-backend-module-catalog';

const getDocumentText = (entity: Entity): string => {
    const documentTexts: string[] = [];
    documentTexts.push(entity.metadata.description || '');
    if (isApiEntity(entity)) {
        documentTexts.push(entity.spec.definition);
    }
    return documentTexts.join(' : ');
};

export const apiPlatformCatalogCollatorEntityTransformer: CatalogCollatorEntityTransformer =
    (entity: Entity) => {
        if (isApiEntity(entity) || (isComponentEntity(entity) && entity.spec?.type === 'service')) {
            return {
                title: entity.metadata.title ?? entity.metadata.name,
                text: getDocumentText(entity),
                componentType: entity.spec?.type?.toString() || 'other',
                type: `api-platform.${isApiEntity(entity) ? 'api' : 'service'}`,
                namespace: entity.metadata.namespace || 'default',
                kind: entity.kind,
                lifecycle: (entity.spec?.lifecycle as string) || '',
                owner: (entity.spec?.owner as string) || '',
            };
        }
        return defaultCatalogCollatorEntityTransformer(entity);
    };