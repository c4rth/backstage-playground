import { mcaComponentsBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { XMLParser, XMLValidator } from 'fast-xml-parser';

const xmlParser = new XMLParser({
  ignoreAttributes: false,  
  attributeNamePrefix: '',
  allowBooleanAttributes: true,
  trimValues: true,
  transformTagName: (tagName) => {
    if (tagName === 'constructor') {
      return '_constructor';
    }
    return tagName;
  }, 
});

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

    return xmlParser.parse(result);
  }, [api, component, refP]);

  return {
    data: value,
    loading: loading || (!value && !error),
    error,
  };
}
