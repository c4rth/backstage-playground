import { AuthService } from '@backstage/backend-plugin-api';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { CatalogService } from '@backstage/plugin-catalog-node';
import {
  CATALOG_KIND,
  CATALOG_METADATA,
} from '@internal/plugin-api-platform-common';

export async function getUserGroups(
  catalog: CatalogService,
  auth: AuthService,
  userEntityRef: string,
): Promise<string[]> {
  const entities = await catalog.getEntities(
    {
      filter: [
        {
          kind: 'group',
          'relations.hasMember': userEntityRef,
        },
      ],
      fields: [CATALOG_METADATA, CATALOG_KIND],
    },
    { credentials: await auth.getOwnServiceCredentials() },
  );
  return entities.items.map(group => stringifyEntityRef(group));
}

export function isUserGuest(userEntityRef: string | undefined): boolean {
  return !userEntityRef || userEntityRef.endsWith('guest');
}
