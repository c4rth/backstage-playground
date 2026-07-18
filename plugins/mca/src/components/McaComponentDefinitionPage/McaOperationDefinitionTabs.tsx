import { ResponseErrorPanel } from '@backstage/core-components';
import { McaOperationAboutTab, UrlLocations } from '../McaComponentAboutTab';
import { memo, useMemo } from 'react';
import { McaComponentFieldsTab } from './McaComponentFieldsTab';
import { McaComponentMethodsTab } from './McaComponentMethodsTab';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { McaComponentSnippet } from '../McaComponentSnippet';
import { Tab, TabList, TabPanel, Tabs } from '@backstage/ui';
import { parseUrlLocations } from '../McaComponentAboutTab';

export interface McaOperationDefinitionTabsProps {
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

export const McaOperationDefinitionTabs = memo<McaOperationDefinitionTabsProps>(
  ({ parsedDefinition, rawXml }) => {
    const configApi = useApi(configApiRef);
    const urlLocations = useMemo<UrlLocations>(
      () => parseUrlLocations(configApi.getOptionalConfigArray('mcaComponents.urlLocations') || []),
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
      <Tabs defaultSelectedKey="tab1">
        <TabList>
          <Tab id="tab1" href=".">Overview</Tab>
          <Tab id="tab2" href='inputfields'>Input Fields</Tab>
          <Tab id="tab3" href='outputfields'>Output Fields</Tab>
          <Tab id="tab4" href='methods'>Methods</Tab>
          <Tab id="tab5" href='raw'>Raw</Tab>
        </TabList>
        <TabPanel id="tab1">
          <McaOperationAboutTab
            operationAnalyze={operationAnalyze}
            operation={operation}
            urlLocations={urlLocations}
          />
        </TabPanel>
        <TabPanel id="tab2">
          <McaComponentFieldsTab data={operation} fieldType="input" />
        </TabPanel>
        <TabPanel id="tab3">
          <McaComponentFieldsTab data={operation} fieldType="output" />
        </TabPanel>
        <TabPanel id="tab4">
          <McaComponentMethodsTab data={operation} componentType="operation" />
        </TabPanel>
        <TabPanel id="tab5">
          <McaComponentSnippet
            filename={`${operationAnalyze.id}.osml`}
            data={rawXml}
          />
        </TabPanel>
      </Tabs>
    );
  },
);
