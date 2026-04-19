import { HeaderLabel, Link } from '@backstage/core-components';
import { Entity } from '@backstage/catalog-model';
import { ComponentDisplayName } from './ComponentDisplayName';

export type EntityLabelsProps = {
  entity: Entity;
};

export const ComponentHeaderLabels = (props: EntityLabelsProps) => {
  const { entity } = props;
  const system = entity.spec?.system?.toString();
  return (
    <>
      {system && (
        <HeaderLabel
          label="Owner"
          value={
            <Link to={`/api-platform/system/${system}`}>
              <div style={{ color: 'var(--bui-fg-solid)' }}>
                <ComponentDisplayName text={system} type="system" />
              </div>
            </Link>
          }
        />
      )}
    </>
  );
};
