import {
  FieldExtensionComponentProps,
} from '@backstage/plugin-scaffolder-react';
import { Alert } from '@backstage/ui';

export const AlertMessage = ({ uiSchema }: FieldExtensionComponentProps<void>) => {
  const message = uiSchema?.['ui:options']?.message as string;
  const status: 'info' | 'success' | 'warning' | 'danger' =
    (uiSchema?.['ui:options']?.severity as
      'info' | 'success' | 'warning' | 'danger') || 'info';

  return <Alert status={status} icon title={message} />;
};
