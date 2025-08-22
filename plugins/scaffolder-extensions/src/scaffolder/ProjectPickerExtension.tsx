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
import Select from '@material-ui/core/Select';
import { ScaffolderField } from '@backstage/plugin-scaffolder-react/alpha';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';

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

    const updateChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
        const proj = String(event.target.value);
        setSelectedProject(proj);
        onChange(proj);
    };

    return (
        <ScaffolderField
            rawErrors={rawErrors}
            rawDescription={description}
            required={required}
            errors={errors}>
            <FormControl required={required} fullWidth>
                <InputLabel id="project-select-label">{title ?? 'Project'}</InputLabel>
                <Select
                    labelId="project-select-label"
                    onChange={updateChange}
                    value={selectedProject}
                >
                    {projects.map(item => (
                        <MenuItem key={item} value={item}>
                            {item}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </ScaffolderField>
    );
};

export const ProjectPickerFieldExtension = scaffolderPlugin.provide(
    createScaffolderFieldExtension({
        name: 'ProjectPicker',
        component: ProjectPicker,
    }),
);