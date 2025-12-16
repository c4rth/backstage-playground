import { ResponseErrorPanel, TabbedLayout } from "@backstage/core-components";
import { McaOperationAboutCard } from "../McaComponentAboutCard";
import { McaOperationFieldsCard } from "../McaComponentFieldsCard";
import { memo, useMemo } from "react";
import { McaOperationMethodsCard } from "../McaComponentMethodsCard";

export interface McaOperationDefinitionPageProps {
    mcaComponent: any;
}

type OperationType = 'atomic' | 'list' | undefined;

type NodesType = {
    operationAnalyze: any;
    operation: any;
    operationType: OperationType;
};

function getOperationNodes(mcaComponent: any): NodesType {
    const { OPERATION: root } = mcaComponent;
    const operationAnalyze = root.SPECIFICATION.OperationAnalyse;
    const { type } = operationAnalyze;
    const { JAVA: java } = root;

    if (!java) {
        return { operationAnalyze, operation: undefined, operationType: undefined };
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

export const McaOperationDefinitionPage = memo<McaOperationDefinitionPageProps>(({ mcaComponent }) => {
    const { operationAnalyze, operation, operationType, error } = useMemo(() => {
        try {
            const nodes = getOperationNodes(mcaComponent);
            
            if (!nodes.operationAnalyze) {
                return { ...nodes, error: new Error('Invalid operation definition: operation analysis not found') };
            }
            if (!nodes.operation) {
                return { ...nodes, error: new Error('Invalid operation definition: required node not found') };
            }
            if (!nodes.operationType) {
                return { ...nodes, error: new Error(`Unknown operation type: ${nodes.operationAnalyze?.type || 'undefined'}`) };
            }
            
            return { ...nodes, error: null };
        } catch (e) {
            return { 
                operationAnalyze: null, 
                operation: null, 
                operationType: undefined, 
                error: e instanceof Error ? e : new Error(String(e)) 
            };
        }
    }, [mcaComponent]);

    if (error) {
        return <ResponseErrorPanel error={error} />;
    }

    return (
        <TabbedLayout>
            <TabbedLayout.Route path="/" title="Overview">
                <McaOperationAboutCard operationAnalyze={operationAnalyze} operation={operation} />
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/inputfields" title="Input Fields">
                <McaOperationFieldsCard operation={operation} operationType={operationType} fieldType="input" />
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/outputfields" title="Output Fields">
                <McaOperationFieldsCard operation={operation} operationType={operationType} fieldType="output" />
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/methods" title="Methods">
                <McaOperationMethodsCard operation={operation} />
            </TabbedLayout.Route>
        </TabbedLayout>
    );
});