import { scaffolderPlugin } from '@backstage/plugin-scaffolder';
import {
  createScaffolderFieldExtension,
  ScaffolderRJSFFieldProps,
} from '@backstage/plugin-scaffolder-react';
import { Alert } from '@backstage/ui';


export const AlertMessage = ({ uiSchema }: ScaffolderRJSFFieldProps<void>) => { 

  const message = uiSchema?.['ui:options']?.message as string;
  const status: 'info' | 'success' | 'warning' | 'danger' = (uiSchema?.['ui:options']?.severity as 'info' | 'success' | 'warning' | 'danger') || 'info';

  return <Alert status={status} icon title={message} />;
};

export const AlertMessageExtension = scaffolderPlugin.provide(
  createScaffolderFieldExtension({
    name: 'AlertMessage',
    component: AlertMessage,
  }),
);
