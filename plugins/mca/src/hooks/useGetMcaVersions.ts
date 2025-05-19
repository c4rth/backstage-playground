import { mcaComponentsBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import { McaVersions } from '@internal/plugin-mca-common';
import useAsync from 'react-use/esm/useAsync';

export function useGetMcaVersions(): {
    versions?: McaVersions;
    loading: boolean;
    error?: Error;
} {

    const api = useApi(mcaComponentsBackendApiRef);

    const { value, loading, error } = useAsync(() => {
        return api.getMcaVersions();
    }, [api]);

    return {
        versions: value || undefined,
        loading,
        error,
    };
}