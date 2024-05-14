import { getRootLogger } from '@backstage/backend-common';
import { Entity, isGroupEntity, isUserEntity, isApiEntity } from '@backstage/catalog-model';
import { CatalogCollatorEntityTransformer } from '@backstage/plugin-search-backend-module-catalog';

const getDocumentText = (entity: Entity): string => {
    const documentTexts: string[] = [];
    documentTexts.push(entity.metadata.description || '');
    if (isUserEntity(entity) || isGroupEntity(entity)) {
        if (entity.spec?.profile?.displayName) {
            documentTexts.push(entity.spec.profile.displayName);
        }
        if (isUserEntity(entity)) {
            if (entity.spec?.profile?.email) {
                documentTexts.push(entity.spec.profile.email);
            }
        }
    } else if (isApiEntity(entity)) {
        getRootLogger().info('myCatalogCollatorEntityTransformer.getDocumentText - API');
        documentTexts.push(entity.spec.definition);
    }
    return documentTexts.join(' : ');
};

export const myCatalogCollatorEntityTransformer: CatalogCollatorEntityTransformer =
    (entity: Entity) => {
        return {
            title: entity.metadata.title ?? entity.metadata.name,
            text: getDocumentText(entity),
            componentType: entity.spec?.type?.toString() || 'other',
            type: entity.spec?.type?.toString() || 'other',
            namespace: entity.metadata.namespace || 'default',
            kind: entity.kind,
            lifecycle: (entity.spec?.lifecycle as string) || '',
            owner: (entity.spec?.owner as string) || '',
        };
    };