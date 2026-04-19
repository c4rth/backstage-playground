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

export interface ComponentAboutContentProps {
  entity: Entity;
}

/** @public */
export const ComponentAboutContent = (props: ComponentAboutContentProps) => {
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
        <AboutField label="description">
          <MarkdownContent
            content={entity?.metadata?.description || 'No Description'}
          />
        </AboutField>
      </Grid.Item>

      <Grid.Item colSpan="4">
        <AboutField label="owner" value="No Owner">
          {ownedByRelations.length > 0 && (
            <EntityRefLinks entityRefs={ownedByRelations} defaultKind="group" />
          )}
        </AboutField>
      </Grid.Item>

      {(isSystem || partOfDomainRelations.length > 0) && (
        <Grid.Item colSpan="4">
          <AboutField label="domain" value="No Domain">
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
          <AboutField label="System" value="No System">
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
          <AboutField label="Parent Component" value="No Parent Component">
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
          <AboutField label="Type" value={entity?.spec?.type as string} />
        </Grid.Item>
      )}

      {(isAPI ||
        isComponent ||
        typeof entity?.spec?.lifecycle === 'string') && (
        <Grid.Item colSpan="4">
          <AboutField
            label="Lifecycle"
            value={entity?.spec?.lifecycle as string}
          />
        </Grid.Item>
      )}

      <Grid.Item colSpan="4">
        <AboutField label="Tags" value="No Tags">
          <TagGroup aria-label="Tags">
            {(entity?.metadata?.tags || []).map(tag => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </TagGroup>
        </AboutField>
      </Grid.Item>
    </Grid.Root>
  );
};
