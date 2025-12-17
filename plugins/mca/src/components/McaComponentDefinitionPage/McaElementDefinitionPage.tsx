import { ResponseErrorPanel, TabbedLayout } from "@backstage/core-components";
import { McaElementAboutCard } from "../McaComponentAboutCard";
import { McaComponentFieldsCard } from "./McaComponentFieldsCard";
import { McaComponentMethodsCard } from "./McaComponentMethodsCard";
import { memo, useMemo } from "react";

export interface McaElementDefinitionPageProps {
  mcaComponent: any;
}

function getElement(mcaComponent: any) {
  const element = mcaComponent?.element;
  if (!element) {
    throw new Error('Invalid element definition: required node not found');
  }
  return element;
}

export const McaElementDefinitionPage = memo<McaElementDefinitionPageProps>(({ mcaComponent }) => {
  const { element, error } = useMemo(() => {
    try {
      return { element: getElement(mcaComponent), error: null };
    } catch (e) {
      return { element: null, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, [mcaComponent]);

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <TabbedLayout>
      <TabbedLayout.Route path="/" title="Overview">
        <McaElementAboutCard element={element} />
      </TabbedLayout.Route>
      <TabbedLayout.Route path="/fields" title="Fields">
        <McaComponentFieldsCard data={element} fieldType="element" />
      </TabbedLayout.Route>
      <TabbedLayout.Route path="/methods" title="Methods">
        <McaComponentMethodsCard data={element} componentType="element" />
      </TabbedLayout.Route>
    </TabbedLayout>
  );
});