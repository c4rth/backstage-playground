import { ResponseErrorPanel, TabbedLayout } from '@backstage/core-components';
import { McaOperationAboutCard, UrlLocations } from '../McaComponentAboutCard';
import { memo, useMemo } from 'react';
import { McaComponentFieldsCard } from './McaComponentFieldsCard';
import { McaComponentMethodsCard } from './McaComponentMethodsCard';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { McaComponentSnippet } from '../McaComponentSnippet';

export interface McaOperationDefinitionPageProps {
  parsedDefinition: any;
  rawXml: string;
}

type OperationType = 'atomic' | 'list' | undefined;

type NodesType = {
  operationAnalyze: any;
  operation: any;
  operationType: OperationType;
};

function getOperationNodes(parsedDefinition: any): NodesType {
  const { OPERATION: root } = parsedDefinition;
  const operationAnalyze = root.SPECIFICATION.OperationAnalyse;
  const { type } = operationAnalyze;
  const { JAVA: java } = root;

  if (!java) {
    return {
      operationAnalyze,
      operation: undefined,
      operationType: undefined,
    };
  }

  let operationType: OperationType;
  let operation;

  if (type.endsWith('OperationAtomique')) {
    operationType = 'atomic';
    operation = java.operationAtomic;
  } else if (type.endsWith('OperationList')) {
    operationType = 'list';
    operation = java.operationList;
  } else {
    operationType = undefined;
    operation = undefined;
  }

  return { operationAnalyze, operation, operationType };
}

export const McaOperationDefinitionPage = memo<McaOperationDefinitionPageProps>(
  ({ parsedDefinition, rawXml }) => {
    const configApi = useApi(configApiRef);
    const urlLocations = useMemo<UrlLocations>(
      () => ({
        oldDns: configApi.getString('mcaComponents.urlLocations.oldDns'),
        newDns: configApi.getString('mcaComponents.urlLocations.newDns'),
      }),
      [configApi],
    );

    const { operationAnalyze, operation, error } = useMemo(() => {
      try {
        const nodes = getOperationNodes(parsedDefinition);

        if (!nodes.operationAnalyze) {
          return {
            ...nodes,
            error: new Error(
              'Invalid operation definition: operation analysis not found',
            ),
          };
        }
        if (!nodes.operation) {
          return {
            ...nodes,
            error: new Error(
              'Invalid operation definition: required node not found',
            ),
          };
        }
        if (!nodes.operationType) {
          return {
            ...nodes,
            error: new Error(
              `Unknown operation type: ${nodes.operationAnalyze?.type || 'undefined'}`,
            ),
          };
        }

        return { ...nodes, error: null };
      } catch (e) {
        return {
          operationAnalyze: null,
          operation: null,
          operationType: undefined,
          error: e instanceof Error ? e : new Error(String(e)),
        };
      }
    }, [parsedDefinition]);

    if (error) {
      return <ResponseErrorPanel error={error} />;
    }

    return (
      <TabbedLayout>
        <TabbedLayout.Route path="/" title="Overview">
          <McaOperationAboutCard
            operationAnalyze={operationAnalyze}
            operation={operation}
            urlLocations={urlLocations}
          />
        </TabbedLayout.Route>
        <TabbedLayout.Route path="/inputfields" title="Input Fields">
          <McaComponentFieldsCard data={operation} fieldType="input" />
        </TabbedLayout.Route>
        <TabbedLayout.Route path="/outputfields" title="Output Fields">
          <McaComponentFieldsCard data={operation} fieldType="output" />
        </TabbedLayout.Route>
        <TabbedLayout.Route path="/methods" title="Methods">
          <McaComponentMethodsCard data={operation} componentType="operation" />
        </TabbedLayout.Route>
        <TabbedLayout.Route path="/raw" title="Raw">
          <McaComponentSnippet
            filename={`${operationAnalyze.id}.osml`}
            data={rawXml}
          />
        </TabbedLayout.Route>
      </TabbedLayout>
    );
  },
);
