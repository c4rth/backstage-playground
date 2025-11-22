import { ResponseErrorPanel, TabbedLayout } from "@backstage/core-components";
import { McaOperationAboutCard } from "../McaComponentAboutCard";
import { McaOperationFieldsCard } from "../McaComponentFieldsCard";
import { memo, useMemo } from "react";
import { McaOperationMethodsCard } from "../McaComponentMethodsCard";

export interface McaOperationDefinitionPageProps {
    mcaComponent: any;
}

type NodesType = {
    operationAnalyze: any;
    operation: any;
    operationType: 'atomic' | 'list' | undefined;
};

function getOperationNodes(mcaComponent: any): NodesType {
    const root = mcaComponent.OPERATION;
    const specification = root.SPECIFICATION;
    const operationAnalyze = specification.OperationAnalyse;
    const type = operationAnalyze.type;
    const java = root.JAVA;
    if (!java) {
        return {
            operationAnalyze,
            operation: undefined,
            operationType: undefined,
        };
    }
    let operation;
    let operationType: 'atomic' | 'list';
    if (type.endsWith('OperationAtomique')) {
        operation = java.operationAtomic;
        operationType = 'atomic';
    } else if (type.endsWith('OperationList')) {
        operation = java.operationList;
        operationType = 'list';
    } else {
        return {
            operationAnalyze,
            operation,
            operationType: undefined
        };
    }
    return {
        operationAnalyze,
        operation,
        operationType,
    };
}

export const McaOperationDefinitionPage = memo<McaOperationDefinitionPageProps>(({ mcaComponent }) => {
    const operationNodesResult = useMemo(() => {
        try {
            return { nodes: getOperationNodes(mcaComponent), error: null as Error | null };
        } catch (e) {
            return { nodes: null as any, error: e instanceof Error ? e : new Error(String(e)) };
        }
    }, [mcaComponent]);

    const { nodes: operationNodes, error: getNodesError } = operationNodesResult;
    const operationAnalyze = operationNodes?.operationAnalyze;
    const operation = operationNodes?.operation;
    const operationType = operationNodes?.operationType;

    const errorState = useMemo(() => {
        if (getNodesError) return getNodesError;
        if (!operationAnalyze) {
            return new Error('Invalid operation definition: operation analysis not found');
        }
        if (!operation) {
            return new Error('Invalid operation definition: required node not found');
        }
        if (!operationType) {
            return new Error(`Unknown operation type: ${operationAnalyze?.type || 'undefined'}`);
        }
        return null;
    }, [getNodesError, operationAnalyze, operation, operationType]);

    const overviewProps = useMemo(() => ({
        operationAnalyze,
        operation,
    }), [operationAnalyze, operation]);

    const inputFieldsProps = useMemo(() => ({
        operation,
        operationType,
        fieldType: 'input' as const,
    }), [operation, operationType]);

    const outputFieldsProps = useMemo(() => ({
        operation,
        operationType,
        fieldType: 'output' as const,
    }), [operation, operationType]);

    const methodsCardProps = useMemo(() => ({
        operation,
    }), [operation]);

    if (errorState) {
        return <ResponseErrorPanel error={errorState} />;
    }

    return (
        <TabbedLayout>
            <TabbedLayout.Route path="/" title="Overview">
                <McaOperationAboutCard {...overviewProps} />
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/inputfields" title="Input Fields">
                <McaOperationFieldsCard {...inputFieldsProps} />
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/outputfields" title="Output Fields">
                <McaOperationFieldsCard {...outputFieldsProps} />
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/methods" title="Methods">
                <McaOperationMethodsCard {...methodsCardProps} />
            </TabbedLayout.Route>
        </TabbedLayout>
    );
});