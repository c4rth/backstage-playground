export interface McaElementMethodsCardProps {
    element: any;
}

export const McaElementMethodsCard = (props: McaElementMethodsCardProps) => {
    const { element } = props;

    return (
        <div> 
            <div>Methods:</div>
            <div>
                {element.implementedMethods.implementedMethod.map((item: any, index: any) => (
                    <li key={index}>{item.name} </li>
                ))
                }
            </div>
        </div>
    );
}