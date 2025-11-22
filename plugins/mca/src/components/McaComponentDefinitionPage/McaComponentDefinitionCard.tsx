import {
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { McaComponent } from '@internal/plugin-mca-common';
import { useGetMcaComponentDefinition } from '../../hooks';
import { XMLParser } from 'fast-xml-parser';
import { McaOperationDefinitionPage } from './McaOperationDefinitionPage';
import { McaElementDefinitionPage } from './McaElementDefinitionPage';
import { useMemo, memo } from 'react';

const xmlParserConfig = {
  ignoreAttributes: false,
  attributeNamePrefix: '',
  allowBooleanAttributes: true,
  trimValues: true,
};

const xmlParser = new XMLParser(xmlParserConfig);

function parseXML(data: string) {
  return xmlParser.parse(data);
}

function getComponentType(componentName: string): 'operation' | 'element' | 'unknown' {
  if (!componentName?.trim()) {
    return 'unknown';
  }
  if (componentName.startsWith('Operation')) {
    return 'operation';
  }
  if (componentName.startsWith('Element')) {
    return 'element';
  }
  return 'unknown';
}

export interface McaComponentDefinitionCardProps {
  mca: McaComponent;
  version: string;
}

export const McaComponentDefinitionCard = memo<McaComponentDefinitionCardProps>(({ mca, version }) => {
  const { data, loading, error } = useGetMcaComponentDefinition(mca.component, version);

  const componentType = useMemo(() =>
    getComponentType(mca.component),
    [mca.component]
  );

 const { mcaComponent, parseError } = useMemo(() => {
    if (!data) return { mcaComponent: null as any, parseError: null as Error | null };
    try {
      return { mcaComponent: parseXML(data), parseError: undefined };
    } catch (e) {
      return { mcaComponent: null as any, parseError: e instanceof Error ? e : new Error(String(e)) };
    }
  }, [data]);

  const componentProps = useMemo(() => ({
    mcaComponent,
  }), [mcaComponent]);

  if (parseError || error) return <ResponseErrorPanel error={parseError ?? error!} />;
  if (loading) return <Progress />;
  if (!data) return <ResponseErrorPanel error={new Error(`No MCA component definition for '${mca.component}' received`)} />;

  switch (componentType) {
    case 'operation':
      return <McaOperationDefinitionPage {...componentProps} />;
    case 'element':
      return <McaElementDefinitionPage {...componentProps} />;
    default:
      return <ResponseErrorPanel error={new Error(`Unknown MCA component type: ${mca.component}`)} />;
  }
});