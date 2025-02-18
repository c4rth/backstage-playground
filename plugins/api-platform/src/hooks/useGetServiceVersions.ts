import { apiPlatformBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { ServiceDefinition } from '@internal/plugin-api-platform-common';


export function useGetServiceVersions(
    serviceName: string
): {
    item?: ServiceDefinition;
    loading: boolean;
    error?: Error;
} {
    const api = useApi(apiPlatformBackendApiRef);

    const { value, loading, error } = useAsync(() => {
        return api.getServiceVersions({ serviceName: serviceName });
    }, [api, top, status]);

    return {
        item: value,
        loading,
        error,
    };
}