import { AuthService } from '@backstage/backend-plugin-api';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  EntityFilterQuery,
  EntityOrderQuery,
} from '@backstage/catalog-client';
import { CatalogService } from '@backstage/plugin-catalog-node';
import {
  CATALOG_KIND,
  CATALOG_METADATA,
  OwnershipType,
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

export async function fetchCatalogEntitiesWithOwnership(options: {
  catalog: CatalogService;
  auth: AuthService;
  filter: EntityFilterQuery;
  fields: string[];
  ownershipType: OwnershipType;
  userEntityRef: string | undefined;
  order?: EntityOrderQuery;
}): Promise<Entity[]> {
  const {
    catalog,
    auth,
    filter,
    fields,
    ownershipType,
    userEntityRef,
    order,
  } = options;
  if (ownershipType === 'owned' && isUserGuest(userEntityRef)) {
    return [];
  }

  const [entities, userGroupRefs] = await Promise.all([
    catalog
      .getEntities(
        { filter, fields, order },
        { credentials: await auth.getOwnServiceCredentials() },
      )
      .then(response => response.items),
    ownershipType === 'owned' && userEntityRef
      ? getUserGroups(catalog, auth, userEntityRef)
      : Promise.resolve([] as string[]),
  ]);

  if (ownershipType === 'owned' && userEntityRef && userGroupRefs.length > 0) {
    const groupSet = new Set(userGroupRefs);
    return entities.filter(entity =>
      groupSet.has(entity.spec?.owner?.toString() || ''),
    );
  }

  return entities;
}
