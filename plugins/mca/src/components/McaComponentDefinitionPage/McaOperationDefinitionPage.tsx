import { ResponseErrorPanel, TabbedLayout } from "@backstage/core-components";
import { McaOperationAboutCard } from "../McaComponentAboutCard";
import { McaOperationFieldsCard } from "../McaComponentFieldsCard";

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

export const McaOperationDefinitionPage = ({ mcaComponent }: McaOperationDefinitionPageProps) => {
  const { operationAnalyze, operation, operationType } = getOperationNodes(mcaComponent);

  if (!operation) {
    return <ResponseErrorPanel error={new Error('Invalid operation definition: required node not found')} />;
  }
  if (!operationType) {
    return <ResponseErrorPanel error={new Error(`Unknown operation type: ${operationAnalyze.type}`)} />;
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
    </TabbedLayout>
  );
}