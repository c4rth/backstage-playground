import { mcaComponentsBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import { McaComponent } from '@internal/plugin-mca-components-common';
import useAsync from 'react-use/esm/useAsync';

export function useGetMcaComponent(component: string): {
    mca?: McaComponent;
    loading: boolean;
    error?: Error;
} {

    const api = useApi(mcaComponentsBackendApiRef);

    const { value, loading, error } = useAsync(() => {
        return api.getMcaComponent(component);
    }, [api]);

    return {
        mca: value,
        loading,
        error,
    };
}