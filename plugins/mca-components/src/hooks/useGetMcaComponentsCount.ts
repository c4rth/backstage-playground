import { mcaComponentsBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';

export function useGetMcaComponentsCount(): {
    count: number;
    loading: boolean;
    error?: Error;
} {

    const api = useApi(mcaComponentsBackendApiRef);

    const { value, loading, error } = useAsync(() => {
        return api.getMcaComponentsCount();
    }, [api]);

    return {
        count: value ? value : 0,
        loading,
        error,
    };
}