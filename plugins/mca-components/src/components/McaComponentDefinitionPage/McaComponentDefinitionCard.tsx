import {
    Progress,
    ResponseErrorPanel,
    TabbedLayout,
} from '@backstage/core-components';
import { McaComponent } from '@internal/plugin-mca-components-common';
import { useGetMcaComponentDefinition } from '../../hooks';

export interface McaComponentDefinitionCardProps {
    mca: McaComponent;
    version: string;
}

export const McaComponentDefinitionCard = (props: McaComponentDefinitionCardProps) => {

    const { mca, version } = props;

    const { data, loading, error } = useGetMcaComponentDefinition(mca.component, mca.packageName, version);

    if (error) {
        return <ResponseErrorPanel error={error} />;
    }

    if (loading) {
        return <Progress />
    }

    return (
        <TabbedLayout>
            <TabbedLayout.Route path="/" title="Definition">
                <div>
                    <div>Definition</div>
                    <div>{JSON.stringify(mca)}</div>
                    <div>{version}</div>
                </div>
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/info" title="Info">
                <div>
                    <div>Definition</div>
                    <div>{data}</div>
                </div>
            </TabbedLayout.Route>
        </TabbedLayout>
    );
}
