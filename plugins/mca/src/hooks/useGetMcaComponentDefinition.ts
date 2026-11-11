import { mcaComponentsBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { XMLValidator } from 'fast-xml-parser';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { mcaTranslationRef } from '../translation';

export function useGetMcaComponentDefinition(component: string, refP: string) {
  const { t } = useTranslationRef(mcaTranslationRef);
  const api = useApi(mcaComponentsBackendApiRef);

  const { value, loading, error } = useAsync(async () => {
    if (!component || !refP) return undefined;

    const result = await api.getMcaComponentDefinition(component, refP);
    if (!result) return undefined;

    const validationResult = XMLValidator.validate(result);
    if (validationResult !== true) {
      throw new Error(
        t('definition.invalidXml', {
          message: validationResult.err.msg,
          line: String(validationResult.err.line),
        }),
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
