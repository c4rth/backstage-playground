import { appRegistryBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';

export function useGetOperations(
  system?: string,
  appName?: string,
  appVersion?: string,
  environment?: string,
) {
  const api = useApi(appRegistryBackendApiRef);

  const { value, loading, error } = useAsync(() => {
    /*
    if (!system || !appName || !appVersion || !environment) return Promise.resolve(undefined);
    return api.getOperations(system, appName, appVersion, environment);
    */
    return Promise.resolve([
      {
        method: 'GET',
        name: 'Get User',
        abac: true,
        bFunction: 'B12345',
        pdpMapping: [
          { valuePath: 'user.id', pdpField: 'subject.id' },
          { valuePath: 'user.role', pdpField: 'subject.role' },
        ],
      },
      {
        method: 'POST',
        name: 'Create User',
        abac: false,
        bFunction: 'B45678',
        pdpMapping: [
          { valuePath: 'user.name', pdpField: 'subject.name' },
          { valuePath: 'user.email', pdpField: 'subject.email' },
        ],
      },
      {
        method: 'POST',
        name: 'Xxx User',
        abac: true,
        bFunction: 'B45678',
      },
    ]);
    
  }, [api, system, appName, appVersion, environment]);

  return {
    data: value,
    loading,
    error,
  };
}