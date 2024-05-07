import { ApiEntityV1alpha1, Entity, isApiEntity } from '@backstage/catalog-model';
import { IndexableDocument } from '@backstage/plugin-search-common';

export interface ApisDocument extends IndexableDocument {
  type: string;
  kind: string;
  namespace: string;
  lifecycle: string;
  owner: string;
}

export type ApiCollatorEntityTransformer = (
  entity: Entity,
) => Omit<ApisDocument, 'location' | 'authorization'>;


const getDocumentText = (entity: Entity): string => {
  const documentTexts: string[] = [];
  documentTexts.push(entity.metadata.description || '');
  if (isApiEntity(entity)) {
    const apiEntity = entity as ApiEntityV1alpha1;
    documentTexts.push(apiEntity.spec.definition);
  }
  return documentTexts.join(' : ');
};

export const defaultApiCollatorEntityTransformer: ApiCollatorEntityTransformer =
  (entity: Entity) => {
    return {      
      title: entity.metadata.title ?? entity.metadata.name,
      text: getDocumentText(entity),
      kind: entity.kind,
      namespace: entity.metadata.namespace || 'default',
      type: entity.spec?.type?.toString() || 'other',
      lifecycle: (entity.spec?.lifecycle as string) || '',
      owner: (entity.spec?.owner as string) || '',
    };
  };