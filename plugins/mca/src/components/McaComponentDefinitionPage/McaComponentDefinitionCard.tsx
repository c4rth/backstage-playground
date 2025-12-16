import {
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { McaComponent } from '@internal/plugin-mca-common';
import { useGetMcaComponentDefinition } from '../../hooks';
import { McaOperationDefinitionPage } from './McaOperationDefinitionPage';
import { McaElementDefinitionPage } from './McaElementDefinitionPage';
import { useMemo, memo } from 'react';

function getComponentType(componentName: string): 'operation' | 'element' | 'unknown' {
  if (!componentName?.trim()) {
    return 'unknown';
  }
  if (componentName.startsWith('Operation')) {
    return 'operation';
  }
  if (componentName.startsWith('Element')) {
    return 'element';
  }
  return 'unknown';
}

export interface McaComponentDefinitionCardProps {
  mca: McaComponent;
  version: string;
}

export const McaComponentDefinitionCard = memo<McaComponentDefinitionCardProps>(({ mca, version }) => {
  const { data, loading, error } = useGetMcaComponentDefinition(mca.component, version);

  const componentType = useMemo(() =>
    getComponentType(mca.component),
    [mca.component]
  );


  if (loading) return <Progress />;
  if (error) {
    console.error(error);
    return <ResponseErrorPanel error={error} />;
  }

  switch (componentType) {
    case 'operation':
      return <McaOperationDefinitionPage mcaComponent={data} />;
    case 'element':
      return <McaElementDefinitionPage mcaComponent={data} />;
    default:
      return <ResponseErrorPanel error={new Error(`Unknown MCA component type: ${mca.component}`)} />;
  }
});