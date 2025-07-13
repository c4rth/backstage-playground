import { ResponseErrorPanel, TabbedLayout } from "@backstage/core-components";
import { McaElementAboutCard } from "../McaComponentAboutCard";
import { McaElementFieldsCard } from "../McaComponentFieldsCard";
import { McaElementMethodsCard } from "../McaComponentMethodsCard";
import { memo, useMemo } from "react";

export interface McaElementDefinitionPageProps {
  mcaComponent: any;
}

function getElement(mcaComponent: any) {
  const element = mcaComponent?.element;
  if (!element) {
    return {
      element: null,
      error: new Error('Invalid element definition: required node not found'),
    };
  }
  return {
    element,
    error: null,
  };
}

export const McaElementDefinitionPage = memo<McaElementDefinitionPageProps>(({ mcaComponent }) => {
  const { element, error } = useMemo(() =>
    getElement(mcaComponent),
    [mcaComponent]
  );

  const aboutCardProps = useMemo(() => ({
    element,
  }), [element]);

  const fieldsCardProps = useMemo(() => ({
    element,
  }), [element]);

  const methodsCardProps = useMemo(() => ({
    element,
  }), [element]);

  if (error) {
    return <ResponseErrorPanel error={new Error('Invalid element definition: required node not found')} />;
  }

  return (
    <TabbedLayout>
      <TabbedLayout.Route path="/" title="Overview">
        <McaElementAboutCard {...aboutCardProps} />
      </TabbedLayout.Route>
      <TabbedLayout.Route path="/fields" title="Fields">
        <McaElementFieldsCard {...fieldsCardProps} />
      </TabbedLayout.Route>
      <TabbedLayout.Route path="/methods" title="Methods">
        <McaElementMethodsCard {...methodsCardProps} />
      </TabbedLayout.Route>
    </TabbedLayout>
  );
});