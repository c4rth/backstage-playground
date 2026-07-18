import { HeaderLabel } from '@backstage/core-components';
import { Link } from '@backstage/ui';
import { Entity } from '@backstage/catalog-model';
import { ComponentDisplayName } from '@internal/plugin-api-platform-react';

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
            <Link
              href={`/api-platform/system/${system}`}
              weight="bold"
              color="info"
              standalone
            >
              <div style={{ color: 'var(--bui-accent-fg)' }}>
                <ComponentDisplayName text={system} type="system" />
              </div>
            </Link>
          }
        />
      )}
    </>
  );
};
