import { apiPlatformBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { ServiceDefinition } from '@internal/plugin-api-platform-common';


export function useGetServices(): {
    items?: ServiceDefinition[];
    loading: boolean;
    error?: Error;
} {
    const api = useApi(apiPlatformBackendApiRef);

    const { value, loading, error } = useAsync(() => {
        return api.listServices();
    }, [api, top, status]);

    return {
        items: value?.items,
        loading,
        error,
    };
}