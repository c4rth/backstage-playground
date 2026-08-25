import { GitTag } from '@backstage-community/plugin-azure-devops-common';

import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { azureDevOpsApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { getAnnotationValuesFromEntity } from '@backstage-community/plugin-azure-devops-common';

export function useGitTags(entity: Entity): {
  items?: GitTag[];
  loading: boolean;
  error?: Error;
} {
  const api = useApi(azureDevOpsApiRef);

  const { value, loading, error } = useAsync(() => {
    const { project, repo, host, org } = getAnnotationValuesFromEntity(entity);
    return api.getGitTags(
      project,
      repo as string,
      stringifyEntityRef(entity),
      host,
      org,
    );
  }, [api, entity]);

  return {
    items: value?.items,
    loading,
    error,
  };
}
