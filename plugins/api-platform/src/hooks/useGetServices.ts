
import { Entity } from '@backstage/catalog-model/index';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import useAsync from 'react-use/esm/useAsync';

export function useGetServices(): {
    items?: Entity[];
    loading: boolean;
    error?: Error;
} {
    const catalogApi = useApi(catalogApiRef);

    const { value: catalogResponse, error, loading } = useAsync(() =>
        catalogApi.getEntities({
            filter:   { kind: ['Component'], 'spec.type': ['service'] },
        }),
        [catalogApi],
    );
    return { 
        items: catalogResponse?.items, 
        loading, 
        error 
    };
}