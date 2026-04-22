import { scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { createScaffolderFieldExtension, ScaffolderRJSFFieldProps } from '@backstage/plugin-scaffolder-react';
import { Alert } from '@backstage/ui';

export const AlertMessage = (_props: ScaffolderRJSFFieldProps) => {
    return (
        <Alert
            status="warning"
            icon
            title="Only MCA components promoted to PRD or those where P is &ge; to the current PRD P value are visible."
        />
    );
};

export const AlertMessageExtension = scaffolderPlugin.provide(
    createScaffolderFieldExtension({
        name: 'AlertMessage',
        component: AlertMessage,
    }),
);