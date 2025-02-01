
import { apiPlatformBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import { ApiVersionDefinition } from '@internal/plugin-api-platform-common';
import useAsync from 'react-use/esm/useAsync';

export function useGetApiVersions(
    apiName: string
): {
    apiVersions?: ApiVersionDefinition[];
    loading: boolean;
    error?: Error;
} {

    const api = useApi(apiPlatformBackendApiRef);

    const { value, loading, error } = useAsync(() => {
        return api.getApiVersions({ apiName: apiName });
    }, [api, top, status]);

    return {
        apiVersions: value,
        loading,
        error,
    };
}