import {
    Progress,
    ResponseErrorPanel,
} from '@backstage/core-components';
import { McaComponent } from '@internal/plugin-mca-components-common';
import { useGetMcaComponentDefinition } from '../../hooks';
import { XMLParser } from 'fast-xml-parser';
import { McaOperationDefinitionPage } from './McaOperationDefinitionPage';
import { McaElementDefinitionPage } from './McaElementDefinitionPage';

function parseXML(data: string) {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
        allowBooleanAttributes: true,
        trimValues: true,
    });

    return parser.parse(data);
}

export interface McaComponentDefinitionCardProps {
    mca: McaComponent;
    version: string;
}

export const McaComponentDefinitionCard = (props: McaComponentDefinitionCardProps) => {

    const { mca, version } = props;

    const { data, loading, error } = useGetMcaComponentDefinition(mca.component, version);

    if (error) {
        return <ResponseErrorPanel error={error} />;
    }
    if (loading) {
        return <Progress />
    }
    if (!data) {
        return <ResponseErrorPanel error={new Error(`No MCA component definition for '${mca.component}' received`)} />;
    }

    const mcaComponent = parseXML(data);
    
    if (mca.component.startsWith('Operation')) {
        return <McaOperationDefinitionPage mcaComponent={mcaComponent} />;
    } else if (mca.component.startsWith('Element')) {
        return <McaElementDefinitionPage mcaComponent={mcaComponent} />;
    }
    return <ResponseErrorPanel error={new Error(`Unknown MCA component type: ${mca.component}`)} />;
}