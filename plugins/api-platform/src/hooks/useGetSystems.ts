
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
    }, [api]);

    if (value) {
        value.items.sort((a, b) => {
            const nameA = a.metadata.name.toLowerCase();
            const nameB = b.metadata.name.toLowerCase();

            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        }
        );
    }

    return {
        items: value?.items,
        loading,
        error,
    };
}