import { scaffolderPlugin } from '@backstage/plugin-scaffolder';
import {
  createScaffolderFieldExtension,
  ScaffolderRJSFFieldProps,
} from '@backstage/plugin-scaffolder-react';
import { Alert } from '@backstage/ui';

export const AlertMessage = (props: ScaffolderRJSFFieldProps) => {
  const { type, description } = props.schema;
  const status: 'info' | 'success' | 'warning' | 'danger' = type as
    | 'info'
    | 'success'
    | 'warning'
    | 'danger';

  return <Alert status={status} icon title={description} />;
};

export const AlertMessageExtension = scaffolderPlugin.provide(
  createScaffolderFieldExtension({
    name: 'AlertMessage',
    component: AlertMessage,
  }),
);
