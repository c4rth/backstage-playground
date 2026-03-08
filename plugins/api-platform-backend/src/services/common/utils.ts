import { AuthService } from "@backstage/backend-plugin-api";
import { CatalogApi } from "@backstage/catalog-client";
import { stringifyEntityRef } from "@backstage/catalog-model";
import {
  CATALOG_KIND,
  CATALOG_METADATA,
} from '@internal/plugin-api-platform-common';

export async function getUserGroups(catalogClient: CatalogApi, auth: AuthService, userEntityRef: string): Promise<string[]> {
  const { token } = await auth.getPluginRequestToken({
    onBehalfOf: await auth.getOwnServiceCredentials(),
    targetPluginId: 'catalog',
  });
  const entities = await catalogClient.getEntities(
    {
      filter: [
        {
          kind: 'group',
          'relations.hasMember': userEntityRef,
        },
      ],
      fields: [
        CATALOG_METADATA,
        CATALOG_KIND,
      ],
    },
    { token });
  return entities.items.map(group => stringifyEntityRef(group));
}

export function isUserGuest(userEntityRef: string | undefined): boolean {
  return !userEntityRef || userEntityRef.endsWith('guest');
}