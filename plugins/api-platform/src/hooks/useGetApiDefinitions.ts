
import { apiPlatformApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { Entity } from '@backstage/catalog-model';

export function useGetApiDefinitions(
): {
    items?: Entity[];
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