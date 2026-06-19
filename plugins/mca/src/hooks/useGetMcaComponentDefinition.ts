import { mcaComponentsBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { XMLValidator } from 'fast-xml-parser';

export function useGetMcaComponentDefinition(component: string, refP: string) {
  const api = useApi(mcaComponentsBackendApiRef);

  const { value, loading, error } = useAsync(async () => {
    if (!component || !refP) return undefined;

    const result = await api.getMcaComponentDefinition(component, refP);
    if (!result) return undefined;

    const validationResult = XMLValidator.validate(result);
    if (validationResult !== true) {
      throw new Error(
        `Invalid XML: ${validationResult.err.msg} (line ${validationResult.err.line})`,
      );
    }

    return result;
  }, [api, component, refP]);

  return {
    rawXml: value,
    loading: loading || (!value && !error),
    error,
  };
}
