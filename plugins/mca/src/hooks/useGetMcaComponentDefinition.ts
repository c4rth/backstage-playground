import { mcaComponentsBackendApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import { XMLParser } from 'fast-xml-parser';

const xmlParserConfig = {
  ignoreAttributes: false,
  attributeNamePrefix: '',
  allowBooleanAttributes: true,
  trimValues: true,
};
const xmlParser = new XMLParser(xmlParserConfig);

export function useGetMcaComponentDefinition(component: string, refP: string) {
  const api = useApi(mcaComponentsBackendApiRef);

  const { value, loading, error } = useAsync(async () => {
    const result = await api.getMcaComponentDefinition(component, refP);
    return result ? xmlParser.parse(result) : undefined;
  }, [api, component, refP]);

  return {
    data: value,
    loading,
    error,
  };
}