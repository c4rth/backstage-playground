
import { apiPlatformBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { SystemDefinition } from '@internal/plugin-api-platform-common';

export function useGetSystem(
    systemName: string
): {
    systemDefinition?: SystemDefinition;
    loading: boolean;
    error?: Error;
} {

    const api = useApi(apiPlatformBackendApiRef);

    const { value, loading, error } = useAsync(() => {
        return api.getSystem({ systemName: systemName });
    }, [api, top, status]);

    return {
        systemDefinition: value,
        loading,
        error,
    };
}