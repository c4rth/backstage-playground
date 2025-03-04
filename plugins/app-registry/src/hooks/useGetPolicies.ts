
import { appRegistryBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';

export function useGetPolicies(
    appCode: string | undefined,
    appName: string | undefined,
    appVersion: string | undefined,
    environment: string | undefined,
): {
    data?: any;
    loading: boolean;
    error?: Error;
} {

    const api = useApi(appRegistryBackendApiRef);

    const { value: data, loading, error } = useAsync(() => {
        if (!appCode || !appName || !appVersion || !environment) {
            return Promise.resolve(undefined);
        }
        return api.getPolicies(appCode, appName, appVersion, environment);
    }, [api, top, status]);

    return {
        data: data,
        loading,
        error,
    };
}