import { ResponseErrorPanel } from '@backstage/core-components';
import { McaElementAboutTab } from '../McaComponentAboutTab';
import { McaComponentFieldsTab } from './McaComponentFieldsTab';
import { McaComponentMethodsTab } from './McaComponentMethodsTab';
import { memo, useMemo } from 'react';
import { McaComponentSnippet } from '../McaComponentSnippet';
import { Tab, TabList, TabPanel, Tabs } from '@backstage/ui';

export interface McaElementDefinitionTabsProps {
  parsedDefinition: any;
  rawXml: string;
}

function getElement(parsedDefinition: any) {
  const element = parsedDefinition?.element;
  if (!element) {
    throw new Error('Invalid element definition: required node not found');
  }
  return element;
}

export const McaElementDefinitionTabs = memo<McaElementDefinitionTabsProps>(
  ({ parsedDefinition, rawXml }) => {
    const { element, error } = useMemo(() => {
      try {
        return { element: getElement(parsedDefinition), error: null };
      } catch (e) {
        return {
          element: null,
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
          <Tab id="tab1" href=".">
            Overview
          </Tab>
          <Tab id="tab2" href="fields">
            Fields
          </Tab>
          <Tab id="tab3" href="methods">
            Methods
          </Tab>
          <Tab id="tab4" href="raw">
            Raw
          </Tab>
        </TabList>
        <TabPanel id="tab1">
          <McaElementAboutTab element={element} />
        </TabPanel>
        <TabPanel id="tab2">
          <McaComponentFieldsTab data={element} fieldType="element" />
        </TabPanel>
        <TabPanel id="tab3">
          <McaComponentMethodsTab data={element} componentType="element" />
        </TabPanel>
        <TabPanel id="tab4">
          <McaComponentSnippet
            filename={`${element.name}.esml`}
            data={rawXml}
          />
        </TabPanel>
      </Tabs>
    );
  },
);
