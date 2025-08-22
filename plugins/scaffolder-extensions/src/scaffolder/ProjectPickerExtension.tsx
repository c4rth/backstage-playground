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
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import { Select, SelectedItems, SelectItem } from '@backstage/core-components';

const ProjectPicker = (props: FieldExtensionComponentProps<string>) => {
    const {
        onChange,
        required,
        schema: { title, description },
        rawErrors,
        formData,
    } = props;

    const [projects, setProjects] = useState<SelectItem[]>([]);

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

        const result = items.map(item => ({ value: item.metadata.name, label: item.metadata.name }));
        setProjects(result);
    });

    const updateChange = (
        values: SelectedItems | null,
    ) => {
        const proj = String(Array.isArray(values) ? values[0] : values) ?? undefined;
        setSelectedProject(proj);
        onChange(proj);
    };

    return (
        <FormControl
            id="project-picker"
            margin='normal'
            required={required}
            error={rawErrors?.length > 0 && !formData}>
            <Select
                native
                label={title ?? 'Project'}
                onChange={updateChange}
                selected={selectedProject}
                items={projects}
            />
            <FormHelperText>{description}</FormHelperText>
        </FormControl>
    );
};

export const ProjectPickerFieldExtension = scaffolderPlugin.provide(
    createScaffolderFieldExtension({
        name: 'ProjectPicker',
        component: ProjectPicker,
    }),
);