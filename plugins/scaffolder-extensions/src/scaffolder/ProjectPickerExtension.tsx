import { scaffolderPlugin } from '@backstage/plugin-scaffolder';
import {
    createScaffolderFieldExtension,
    FieldExtensionComponentProps,
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

const ProjectPicker = (props: FieldExtensionComponentProps<string>) => {
    const {
        onChange,
        required,
        schema: { title, description },
        rawErrors,
        errors,
    } = props;

    const [projects, setProjects] = useState<string[]>([]);

    const [selectedProject, setSelectedProject] = useState<undefined | string>(undefined);

    const identityApi = useApi(identityApiRef);
    const catalogApi = useApi(catalogApiRef);
    const errorApi = useApi(errorApiRef);

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

    return (
        <ScaffolderField
            rawErrors={rawErrors}
            rawDescription={description}
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
                    label={title} />
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
