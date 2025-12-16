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
    throw new Error('Invalid element definition: required node not found');
  }
  return element;
}

export const McaElementDefinitionPage = memo<McaElementDefinitionPageProps>(({ mcaComponent }) => {

  const { element, error } = useMemo(() => {
    try {
      return { element: getElement(mcaComponent), error: null as Error | null };
    } catch (e) {
      return { element: null as any, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, [mcaComponent]);

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
    console.error(error);
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