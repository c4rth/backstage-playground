import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { McaComponent } from '@internal/plugin-mca-common';
import { useGetMcaComponentDefinition } from '../../hooks';
import { McaOperationDefinitionTabs } from './McaOperationDefinitionTabs';
import { McaElementDefinitionTabs } from './McaElementDefinitionTabs';
import { memo, useMemo } from 'react';
import { XMLParser } from 'fast-xml-parser';

function getComponentType(
  componentName: string,
): 'operation' | 'element' | 'unknown' {
  if (componentName?.startsWith('Operation')) return 'operation';
  if (componentName?.startsWith('Element')) return 'element';
  return 'unknown';
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  allowBooleanAttributes: true,
  trimValues: true,
  transformTagName: tagName => {
    if (tagName === 'constructor') {
      return '_constructor';
    }
    return tagName;
  },
});

export interface McaComponentDefinitionTabsProps {
  mca: McaComponent;
  version: string;
}

export const McaComponentDefinitionTabs = memo<McaComponentDefinitionTabsProps>(
  ({ mca, version }) => {
    const { rawXml, loading, error } = useGetMcaComponentDefinition(
      mca.component,
      version,
    );

    const componentType = getComponentType(mca.component);

    const { parsedXml, parseError } = useMemo(() => {
      if (!rawXml) {
        return { parsedXml: null, parseError: null };
      }

      try {
        return { parsedXml: xmlParser.parse(rawXml), parseError: null };
      } catch (e) {
        return {
          parsedXml: null,
          parseError: e instanceof Error ? e : new Error(String(e)),
        };
      }
    }, [rawXml]);

    if (error) return <ResponseErrorPanel error={error} />;
    if (loading || !rawXml) return <Progress />;

    if (parseError) {
      return <ResponseErrorPanel error={parseError} />;
    }

    switch (componentType) {
      case 'operation':
        return (
          <McaOperationDefinitionTabs
            parsedDefinition={parsedXml}
            rawXml={rawXml}
          />
        );
      case 'element':
        return (
          <McaElementDefinitionTabs
            parsedDefinition={parsedXml}
            rawXml={rawXml}
          />
        );
      default:
        return (
          <ResponseErrorPanel
            error={new Error(`Unknown MCA component type: ${mca.component}`)}
          />
        );
    }
  },
);
