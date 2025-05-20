export interface McaElementMethodsCardProps {
    element: any;
}

export const McaElementMethodsCard = ({ element }: McaElementMethodsCardProps) => (
  <div>
    <div>Methods:</div>
    <ul>
      {(element.implementedMethods?.implementedMethod || []).map((item: any, index: number) => (
        <li key={index}>{item.name}</li>
      ))}
    </ul>
  </div>
);