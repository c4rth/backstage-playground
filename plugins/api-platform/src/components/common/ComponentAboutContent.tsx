import {
  Entity,
  RELATION_OWNED_BY,
  RELATION_PART_OF,
} from '@backstage/catalog-model';
import {
  EntityRefLinks,
  getEntityRelations,
} from '@backstage/plugin-catalog-react';
import { MarkdownContent } from '@backstage/core-components';
import { AboutField } from '@backstage/plugin-catalog';
import { Grid, Tag, TagGroup } from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { apiPlatformTranslationRef } from '../../translation';

export interface ComponentAboutContentProps {
  entity: Entity;
}

/** @public */
export const ComponentAboutContent = (props: ComponentAboutContentProps) => {
  const { t } = useTranslationRef(apiPlatformTranslationRef);
  const { entity } = props;

  const isSystem = entity.kind.toLocaleLowerCase('en-US') === 'system';
  const isResource = entity.kind.toLocaleLowerCase('en-US') === 'resource';
  const isComponent = entity.kind.toLocaleLowerCase('en-US') === 'component';
  const isAPI = entity.kind.toLocaleLowerCase('en-US') === 'api';
  const isTemplate = entity.kind.toLocaleLowerCase('en-US') === 'template';
  const isLocation = entity.kind.toLocaleLowerCase('en-US') === 'location';
  const isGroup = entity.kind.toLocaleLowerCase('en-US') === 'group';

  const partOfSystemRelations = getEntityRelations(entity, RELATION_PART_OF, {
    kind: 'system',
  });
  const partOfComponentRelations = getEntityRelations(
    entity,
    RELATION_PART_OF,
    {
      kind: 'component',
    },
  );
  const partOfDomainRelations = getEntityRelations(entity, RELATION_PART_OF, {
    kind: 'domain',
  });
  const ownedByRelations = getEntityRelations(entity, RELATION_OWNED_BY);

  return (
    <Grid.Root columns="12">
      <Grid.Item colSpan="12">
        <AboutField label={t('about.description')}>
          <MarkdownContent
            content={entity?.metadata?.description || t('about.noDescription')}
          />
        </AboutField>
      </Grid.Item>

      <Grid.Item colSpan="4">
        <AboutField label={t('about.owner')} value={t('about.noOwner')}>
          {ownedByRelations.length > 0 && (
            <EntityRefLinks entityRefs={ownedByRelations} defaultKind="group" />
          )}
        </AboutField>
      </Grid.Item>

      {(isSystem || partOfDomainRelations.length > 0) && (
        <Grid.Item colSpan="4">
          <AboutField label={t('about.domain')} value={t('about.noDomain')}>
            {partOfDomainRelations.length > 0 && (
              <EntityRefLinks
                entityRefs={partOfDomainRelations}
                defaultKind="domain"
              />
            )}
          </AboutField>
        </Grid.Item>
      )}

      {(isAPI ||
        isComponent ||
        isResource ||
        partOfSystemRelations.length > 0) && (
        <Grid.Item colSpan="4">
          <AboutField label={t('about.system')} value={t('about.noSystem')}>
            {partOfSystemRelations.length > 0 && (
              <EntityRefLinks
                entityRefs={partOfSystemRelations}
                defaultKind="system"
              />
            )}
          </AboutField>
        </Grid.Item>
      )}

      {isComponent && partOfComponentRelations.length > 0 && (
        <Grid.Item colSpan="4">
          <AboutField label={t('about.parent')} value={t('about.noParent')}>
            <EntityRefLinks
              entityRefs={partOfComponentRelations}
              defaultKind="component"
            />
          </AboutField>
        </Grid.Item>
      )}

      {(isAPI ||
        isComponent ||
        isResource ||
        isTemplate ||
        isGroup ||
        isLocation ||
        typeof entity?.spec?.type === 'string') && (
        <Grid.Item colSpan="4">
          <AboutField
            label={t('about.type')}
            value={entity?.spec?.type as string}
          />
        </Grid.Item>
      )}

      {(isAPI ||
        isComponent ||
        typeof entity?.spec?.lifecycle === 'string') && (
        <Grid.Item colSpan="4">
          <AboutField
            label={t('about.lifecycle')}
            value={entity?.spec?.lifecycle as string}
          />
        </Grid.Item>
      )}

      <Grid.Item colSpan="4">
        <AboutField label={t('about.tags')} value={t('about.noTags')}>
          <TagGroup aria-label={t('about.tags')}>
            {(entity?.metadata?.tags || []).map(tag => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </TagGroup>
        </AboutField>
      </Grid.Item>
    </Grid.Root>
  );
};
