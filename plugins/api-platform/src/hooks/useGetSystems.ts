import { apiPlatformBackendApiRef } from '../api';
import {
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import useAsync from 'react-use/esm/useAsync';
import { stringifyEntityRef } from '@backstage/catalog-model';


export function useGetSystemsOwnedByUser() {
const identityApi = useApi(identityApiRef);
  const catalogApi = useApi(catalogApiRef);
  const apiPlatformBackendApi = useApi(apiPlatformBackendApiRef);

  const { value, loading, error } = useAsync(async () => {
    const allSystems = await apiPlatformBackendApi.listSystems();
    const profile = await identityApi.getBackstageIdentity();
    const groups = await catalogApi.getEntities({
      filter: [
        {
          kind: 'group',
          'relations.hasMember': profile.userEntityRef,
        },
      ],
      fields: ['metadata', 'kind'],
    });

    // Get the entity references for the user's groups
    const userGroupRefs = groups.items.map(group => stringifyEntityRef(group));

    // Filter systems that are owned by any of the user's groups
    const ownedSystems = allSystems.items.filter(system => {
      const ownedByRelations = system.relations?.filter(rel => rel.type === 'ownedBy') || [];
      return ownedByRelations.some(relation =>
        userGroupRefs.includes(relation.targetRef)
      );
    });

    // Ensure unique systems by using a Map with system entity reference as key
    const uniqueSystems = Array.from(
      new Map(
        ownedSystems.map(system => [stringifyEntityRef(system), system])
      ).values()
    );

    // Sort systems by name
    uniqueSystems.sort((a, b) => {
      const nameA = a.metadata.name.toLowerCase();
      const nameB = b.metadata.name.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return uniqueSystems;
  }, []);

  return {
    items: value ?? [],
    loading,
    error,
  };

}

export function useGetAllSystems() {
  const api = useApi(apiPlatformBackendApiRef);
  const { value, loading, error } = useAsync(() => api.listSystems(), [api]);
  return {
    items: value?.items ?? [],
    loading,
    error,
  };
}