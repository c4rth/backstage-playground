export interface McaElementFieldsCardProps {    
    element: any;
}

export const McaElementFieldsCard = (props: McaElementFieldsCardProps) => {
    const { element } = props;

    return (
        <div>
        <div>{JSON.stringify(element)}</div>
        </div>
    );
}