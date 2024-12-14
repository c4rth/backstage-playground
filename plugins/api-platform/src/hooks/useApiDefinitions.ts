
import { apiPlatformApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { ApiDefinition } from '@internal/plugin-api-platform-common';

export function useApiDefinitions(
): {
    items?: ApiDefinition[];
    loading: boolean;
    error?: Error;
} {

    const api = useApi(apiPlatformApiRef);

    const { value, loading, error } = useAsync(() => {
        return api.listApiDefinitions();
    }, [api, top, status]);

    return {
        items: value?.items,
        loading,
        error,
    };
}