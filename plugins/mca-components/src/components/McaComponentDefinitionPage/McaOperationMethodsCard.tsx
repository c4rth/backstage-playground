export interface McaOperationMethodsCardProps {
    operation: any;
}

export const McaOperationMethodsCard = (props: McaOperationMethodsCardProps) => {
    const { operation } = props;

    return (
        <div>
            <div>Methods:</div>
            <div>
                {operation.implementedMethods.implementedMethod.map((item: any, index: any) => (
                    <li key={index}>{item.name} </li>
                ))
                }
            </div>
        </div>
    );
}