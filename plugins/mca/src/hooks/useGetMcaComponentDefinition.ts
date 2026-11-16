import { mcaComponentsBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { SyntaxValidator, ValidationError } from 'fast-xml-validator';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { mcaTranslationRef } from '../translation';

export function useGetMcaComponentDefinition(component: string, refP: string) {
  const { t } = useTranslationRef(mcaTranslationRef);
  const api = useApi(mcaComponentsBackendApiRef);

  const { value, loading, error } = useAsync(async () => {
    if (!component || !refP) return undefined;

    const result = await api.getMcaComponentDefinition(component, refP);
    if (!result) return undefined;

    try {
      SyntaxValidator.validate(result, { allowBooleanAttributes: true });
    } catch (err) {
      const { message, line } = err as ValidationError;
      throw new Error(
        t('definition.invalidXml', { message, line: String(line) }),
      );
    }

    return result;
  }, [api, component, refP, t]);

  return {
    rawXml: value,
    loading: loading || (!value && !error),
    error,
  };
}
