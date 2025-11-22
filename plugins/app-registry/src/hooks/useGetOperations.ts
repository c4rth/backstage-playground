import { appRegistryBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';

export function useGetOperations() {
  const api = useApi(appRegistryBackendApiRef);

  return async function getOperations(system?: string, appName?: string, appVersion?: string, environment?: string) {

    if (system === "XXX") {
      if (!system || !appName || !appVersion || !environment) return Promise.resolve(undefined);
      return api.getOperations(system, appName, appVersion, environment);
    }

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
          { valuePath: 'user.name', pdpField: 'subject.name subject.name subject.name' },
          { valuePath: 'user.email user.email', pdpField: 'subject.email' },
        ],
      },
      {
        method: 'POST',
        name: 'Xxx User',
        abac: true,
        bFunction: 'B45678',
      },
    ]);
  };
}
