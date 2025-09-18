import { scaffolderPlugin } from '@backstage/plugin-scaffolder';
import {
    createScaffolderFieldExtension,
} from '@backstage/plugin-scaffolder-react';
import {
    errorApiRef,
    identityApiRef,
    useApi,
} from '@backstage/core-plugin-api';
import {
    catalogApiRef,
} from '@backstage/plugin-catalog-react';
import { NotFoundError } from '@backstage/errors';
import useAsync from 'react-use/esm/useAsync';
import { useState } from 'react';
import { ScaffolderField } from '@backstage/plugin-scaffolder-react/alpha';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import useDebounce from 'react-use/esm/useDebounce';
import { useTemplateSecrets } from '@backstage/plugin-scaffolder-react';
import { scmAuthApiRef } from '@backstage/integration-react';
import { ProjectPickerFieldSchema } from './schemas';

export { ProjectPickerSchema } from './schemas';

const ProjectPicker = (props: typeof ProjectPickerFieldSchema.TProps) => {
    const { uiSchema, onChange, rawErrors, errors, schema, required, } = props;

    const [projects, setProjects] = useState<string[]>([]);
    const [selectedProject, setSelectedProject] = useState<undefined | string>(undefined);
    const { secrets, setSecrets } = useTemplateSecrets();

    const identityApi = useApi(identityApiRef);
    const catalogApi = useApi(catalogApiRef);
    const errorApi = useApi(errorApiRef);
    const scmAuthApi = useApi(scmAuthApiRef);

    const { requestUserCredentials } = uiSchema?.['ui:options'] ?? {};

    useAsync(async () => {
        const { userEntityRef } = await identityApi.getBackstageIdentity();

        if (!userEntityRef) {
            errorApi.post(new NotFoundError('No user entity ref found'));
            return;
        }

        const { items } = await catalogApi.getEntities({
            filter: {
                kind: 'Group',
                ['relations.hasMember']: [userEntityRef],
            },
            fields: ['metadata.name'],
        });

        const uniqueNames = Array.from(
            new Set(
                items
                    .map(item => {
                        // Extract ABCD from 'prd.10.gemz.ABCD.ado.x'
                        // const parts = item.metadata.name.split('.');
                        // return parts.length >= 4 ? parts[3] : item.metadata.name;
                        return item.metadata.name;
                    })
            )
        );
        const result: string[] = uniqueNames
            .sort();

        setProjects(result);
    });


    useDebounce(
        async () => {
            if (!requestUserCredentials) {
                return;
            }
            if (secrets[requestUserCredentials.secretsKey]) {
                return;
            }
            const { token } = await scmAuthApi.getCredentials({
                url: `https://dev.azure.com/`,
                additionalScope: {
                    repoWrite: true,
                    customScopes: { azure: [] },
                },
            });
            setSecrets({ [requestUserCredentials.secretsKey]: token });
        },
        500,
        [projects],
    );

    let authStatus = 'No authentication required';
    if (requestUserCredentials) {
        authStatus = secrets[requestUserCredentials.secretsKey] ? 'Authenticated' : 'Authenticating...';
    }
    const rawDescription = `${uiSchema['ui:description'] ?? schema.description} (${authStatus})`;

    return (
        <ScaffolderField
            rawErrors={rawErrors}
            rawDescription={rawDescription}
            required={required}
            errors={errors}>
            <Autocomplete
                value={selectedProject}
                options={projects}
                autoSelect
                renderInput={params => (<TextField
                    {...params}
                    margin="dense"
                    required={required}
                    label={uiSchema['ui:title'] ?? schema.title} />
                )}
                onChange={(_, newValue) => {
                    setSelectedProject(newValue ?? undefined);
                    onChange(newValue ?? undefined);
                }}
            />
        </ScaffolderField>
    );
};

export const ProjectPickerFieldExtension = scaffolderPlugin.provide(
    createScaffolderFieldExtension({
        name: 'ProjectPicker',
        component: ProjectPicker,
    }),
);
