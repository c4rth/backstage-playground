
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef} from '@backstage/plugin-catalog-react';
import useAsync from 'react-use/esm/useAsync';

export function useCatalogEntity(entityRef: string) {
  const catalogApi = useApi(catalogApiRef);

  const {
    value: entity,
    error,
    loading,
  } = useAsync(
    () => catalogApi.getEntityByRef(entityRef),
    [catalogApi],
  );

  return { entity, error, loading };
}