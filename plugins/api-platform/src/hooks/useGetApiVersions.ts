
import { apiPlatformApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import { ApiVersionDefinition } from '@internal/plugin-api-platform-common';
import useAsync from 'react-use/esm/useAsync';

export function useGetApiVersions(
    id: string
): {
    items?: ApiVersionDefinition[];
    loading: boolean;
    error?: Error;
} {

    const api = useApi(apiPlatformApiRef);

    const { value, loading, error } = useAsync(() => {
        return api.getApiDefinitionVersions({ id: id });
    }, [api, top, status]);

    return {
        items: value,
        loading,
        error,
    };
}