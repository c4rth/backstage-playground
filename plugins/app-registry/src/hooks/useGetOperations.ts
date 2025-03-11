
import { appRegistryBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { AppRegistryOperation } from '../types';

export function useGetOperations(
    appCode: string | undefined,
    appName: string | undefined,
    appVersion: string | undefined,
    environment: string | undefined,
): {
    data?: AppRegistryOperation[];
    loading: boolean;
    error?: Error;
} {

    const api = useApi(appRegistryBackendApiRef);

    const { value, loading, error } = useAsync(() => {
        if (!appCode || !appName || !appVersion || !environment) {
            return Promise.resolve(undefined);
        }
        return api.getOperations(appCode, appName, appVersion, environment);
    }, [api, appCode, appName, appVersion, environment]);

    return {
        data: value,
        loading,
        error,
    };
}