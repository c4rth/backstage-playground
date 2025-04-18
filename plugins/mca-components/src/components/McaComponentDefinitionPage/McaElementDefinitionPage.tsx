import { ResponseErrorPanel, TabbedLayout } from "@backstage/core-components";
import { McaElementAboutCard } from "./McaElementAboutCard";
import { McaElementFieldsCard } from "./McaElementFieldsCard";

export interface McaElementDefinitionPageProps {
    mcaComponent: any;
}

export const McaElementDefinitionPage = (props: McaElementDefinitionPageProps) => {
    const { mcaComponent } = props;

    const element = mcaComponent.element;

    if (!element) {
        return <ResponseErrorPanel error={new Error(`Invalid element definition: required node not found`)} />;
    }
    return (
        <TabbedLayout>
            <TabbedLayout.Route path="/" title="Overview">
                <McaElementAboutCard element={element} />
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/fields" title="Fields">
                <McaElementFieldsCard element={element} />
            </TabbedLayout.Route>
        </TabbedLayout>
    );
}