import { Readme } from '@backstage-community/plugin-azure-devops-common';

import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { azureDevOpsApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { getAnnotationValuesFromEntity } from '@backstage-community/plugin-azure-devops-common';

export function useReadme(entity: Entity): {
  item?: Readme;
  loading: boolean;
  error?: Error;
} {
  const api = useApi(azureDevOpsApiRef);

  const { value, loading, error } = useAsync(() => {
    const { project, repo, host, org, readmePath } =
      getAnnotationValuesFromEntity(entity);

    if (readmePath?.startsWith('.')) {
      throw new Error(
        `The "dev.azure.com/readme-path" annotation does not support relative paths, please correct this annotation. The value provided was: "${readmePath}"`,
      );
    }

    const entityRef = stringifyEntityRef(entity);
    return api.getReadme({
      project,
      repo: repo as string,
      entityRef,
      host,
      org,
      path: readmePath,
    });
  }, [api]);

  return {
    item: value,
    loading,
    error,
  };
}
