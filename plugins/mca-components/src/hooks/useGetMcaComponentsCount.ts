import { mcaComponentsBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import { McaComponentType } from '@internal/plugin-mca-components-common';
import useAsync from 'react-use/esm/useAsync';

export function useGetMcaComponentsCount(type: McaComponentType): {
    count: number;
    loading: boolean;
    error?: Error;
} {

    const api = useApi(mcaComponentsBackendApiRef);

    const { value, loading, error } = useAsync(() => {
        return api.getMcaComponentsCount(type);
    }, [api]);

    return {
        count: value ? value : 0,
        loading,
        error,
    };
}