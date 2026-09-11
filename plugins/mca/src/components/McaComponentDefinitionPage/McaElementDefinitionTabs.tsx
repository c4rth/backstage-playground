import { ResponseErrorPanel } from '@backstage/core-components';
import { McaElementAboutTab } from '../McaComponentAboutTab';
import { McaComponentFieldsTab } from './McaComponentFieldsTab';
import { McaComponentMethodsTab } from './McaComponentMethodsTab';
import { memo, useMemo } from 'react';
import { McaComponentSnippet } from '../McaComponentSnippet';
import { Route, Routes } from 'react-router-dom';

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
      <Routes>
        <Route path="/" element={<McaElementAboutTab element={element} />} />
        <Route
          path="fields"
          element={<McaComponentFieldsTab data={element} fieldType="element" />}
        />
        <Route
          path="methods"
          element={
            <McaComponentMethodsTab data={element} componentType="element" />
          }
        />
        <Route
          path="raw"
          element={
            <McaComponentSnippet
              filename={`${element.name}.esml`}
              data={rawXml}
            />
          }
        />
      </Routes>
    );
  },
);
