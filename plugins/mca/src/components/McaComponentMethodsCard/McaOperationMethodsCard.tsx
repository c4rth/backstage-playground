export interface McaOperationMethodsCardProps {
    operation: any;
}

export const McaOperationMethodsCard = ({ operation }: McaOperationMethodsCardProps) => (
  <div>
    <div>Methods:</div>
    <ul>
      {(operation.implementedMethods?.implementedMethod || []).map((item: any, index: number) => (
        <li key={index}>{item.name}</li>
      ))}
    </ul>
  </div>
);