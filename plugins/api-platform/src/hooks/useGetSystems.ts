
import { apiPlatformBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { Entity } from '@backstage/catalog-model';

export function useGetSystems(
): {
    items?: Entity[];
    loading: boolean;
    error?: Error;
} {

    const api = useApi(apiPlatformBackendApiRef);

    const { value, loading, error } = useAsync(() => {
        return api.listSystems();
    }, [api, top, status]);

    return {
        items: value?.items,
        loading,
        error,
    };
}