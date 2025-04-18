
import { mcaComponentsBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';

export function useGetMcaComponentDefinition(
    component: string | undefined,
    packageName: string | undefined,
    refP: string | undefined,
): {
    data?: string;
    loading: boolean;
    error?: Error;
} {

    const api = useApi(mcaComponentsBackendApiRef);

    const { value, loading, error } = useAsync(() => {
        if (!component || !packageName || !refP) {
            return Promise.resolve(undefined);
        }
        return api.getMcaComponentDefinition(component, packageName, refP);
    }, [api, component, packageName, refP]);

    return {
        data: value,
        loading,
        error,
    };
}