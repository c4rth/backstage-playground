export interface McaOperationFieldsCardProps {    
    operation: any;
    operationType: 'atomic' | 'list';
}

export const McaOperationFieldsCard = (props: McaOperationFieldsCardProps) => {
    const { operation, operationType } = props;

    return (
        <div>
        <div>{operationType}</div>
        <div>{JSON.stringify(operation)}</div>
        </div>
    );
}