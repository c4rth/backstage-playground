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

    const { data, loading, error } = useGetMcaComponentDefinition(mca.component, mca.packageName, version);

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

/*

    return (
        <TabbedLayout>
            <TabbedLayout.Route path="/" title="Definition">
                <div>
                    <div>Definition</div>
                    <div>{JSON.stringify(mca)}</div>
                    <div>{version}</div>
                    <div>{data}</div>
                </div>
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/info" title="Info">
                <div>
                    <div>description: <Typography>{operationAnalyze.description}</Typography></div>
                    <div>version: <Typography>{operationAnalyze.version}</Typography></div>
                    <div>cobolName: <Typography>{operationAnalyze.cobolName}</Typography></div>
                    <div>flowControlerName: <Typography>{operationAnalyze.flowControlerName}</Typography></div>
                    <div>bsName: <Typography>{operationAnalyze.bsName}</Typography></div>
                    <div>bfunction: <Typography>{operationAnalyze.bfunction}</Typography></div>
                    <div>ticLocation: <Typography>{operationAnalyze.ticLocation}</Typography></div>
                    <div>ficLocation: <Typography>{operationAnalyze.ficLocation}</Typography></div>
                    <div>cicLocation: <Typography>{operationAnalyze.cicLocation}</Typography></div>
                    <div>useCache: <Typography>{operation.useCache ? 'true' : 'false'}</Typography></div>
                    <div>Input fields:</div>
                    <div>
                        {operation.inputFields.FieldInput.map((item: any, index: any) => (
                            <li key={index}>{item.field.name} {item.mandatory ? 'mandatory' : 'optional'}</li>
                        ))
                        }
                    </div>
                    <div>Output fields:</div>
                    <div>
                        {operation.outputFields.field.map((item: any, index: any) => (
                            <li key={index}>{item.name}</li>
                        ))
                        }
                    </div>
                </div>
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/xml" title="XML">
                <div>
                    <div>{data}</div>
                </div>
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/json" title="JSON">
                <div>
                    <div>{JSON.stringify(mcaComponent)}</div>
                </div>
            </TabbedLayout.Route>
        </TabbedLayout>
    );*/
