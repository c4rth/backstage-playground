import {
  AZURE_DEVOPS_DEFAULT_TOP,
  BuildRun,
  BuildRunOptions,
} from '@backstage-community/plugin-azure-devops-common';

import { azureDevOpsApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { getAnnotationValuesFromEntity } from '@backstage-community/plugin-azure-devops-common';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';

export function useBuildRuns(
  entity: Entity,
  defaultLimit?: number,
): {
  items?: BuildRun[];
  loading: boolean;
  error?: Error;
} {
  const top = defaultLimit ?? AZURE_DEVOPS_DEFAULT_TOP;
  const options: BuildRunOptions = {
    top,
  };

  const api = useApi(azureDevOpsApiRef);

  const { value, loading, error } = useAsync(() => {
    const { project, repo, definition, host, org } =
      getAnnotationValuesFromEntity(entity);
    return api.getBuildRuns(
      project,
      stringifyEntityRef(entity),
      repo,
      definition,
      host,
      org,
      options,
    );
  }, [api, entity, top]);

  return {
    items: value?.items,
    loading,
    error,
  };
}
