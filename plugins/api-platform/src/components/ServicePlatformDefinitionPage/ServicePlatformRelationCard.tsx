import { Link, ResponseErrorPanel, Table, TableColumn } from "@backstage/core-components";
import { memo, useMemo } from 'react';
import { Flex } from "@backstage/ui";
import { Entity, parseEntityRef, RELATION_CONSUMES_API, RELATION_PROVIDES_API } from "@backstage/catalog-model";
import { catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import { useApi } from "@backstage/core-plugin-api";
import useAsync from 'react-use/esm/useAsync';
import { ANNOTATION_API_NAME, ANNOTATION_API_VERSION, CATALOG_METADATA_API_NAME, CATALOG_METADATA_API_VERSION, CATALOG_SPEC_SYSTEM, } from "@internal/plugin-api-platform-common";
import { ComponentDisplayName } from "../common";

type TableRow = {
    id: number;
    name: string;
    version: string;
    system: string
}

const serviceColumns: TableColumn<TableRow>[] = [
    {
        title: 'Name',
        width: '50%',
        field: 'name',
        highlight: true,
        defaultSort: 'asc',
        render: ({ system, name, version }: TableRow) => {
            if (version === 'local') {
                return <ComponentDisplayName text={name} type="api" />;
            }
            return (
                <Link to={`/api-platform/api/${system}/${name}?version=${version}`}>
                    <ComponentDisplayName text={name} type="api" />
                </Link>
            );
        },
    },
    {
        title: 'Version',
        width: '35%',
        field: 'version',
    },
    {
        title: 'System',
        width: '15%',
        highlight: true,
        field: 'system',
        render: ({ system }: TableRow) => {
            if (system === "-") {
                return <ComponentDisplayName text={system} type="system" />;
            }
            return (
                <Link to={`/api-platform/system/${system}`} >
                    <ComponentDisplayName text={system} type="system" />
                </Link >
            );
        },
    }
];

const toRow = (entity: Entity, idx: number): TableRow => ({
    id: idx,
    name: entity.metadata[ANNOTATION_API_NAME]?.toString() ?? '?',
    version: entity.metadata[ANNOTATION_API_VERSION]?.toString() ?? '?',
    system: entity.spec?.system?.toString() ?? '-',
});

const createLocalEntity = (name: string): Entity => ({
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'API',
    metadata: {
        name,
        [ANNOTATION_API_NAME]: name,
        [ANNOTATION_API_VERSION]: 'local',
    },
} as Entity);

const tableOptions = {
    search: true,
    padding: 'dense' as const,
    paging: false,
    draggable: false,
    thirdSortClick: false,
};

interface ServicePlatformRelationCardProps {
    dependency: 'provided' | 'consumed';
}

export const ServicePlatformRelationCard = memo<ServicePlatformRelationCardProps>(({ dependency }) => {
    const { entity } = useEntity();
    const catalogApi = useApi(catalogApiRef);

    const { value: entities = [], loading, error } = useAsync(async () => {
        const relationType = dependency === 'consumed' ? RELATION_CONSUMES_API : RELATION_PROVIDES_API;
        const allRelations = entity.relations?.filter(r => r.type === relationType) ?? [];

        if (allRelations.length === 0) return [];

        const defaultRelations = allRelations.filter(r => r.targetRef.startsWith('api:default/'));
        const localRelations = allRelations.filter(r => r.targetRef.startsWith('api:local/'));

        const relatedEntities: Entity[] = [];

        if (defaultRelations.length > 0) {
            const targetNames = defaultRelations.map(r => parseEntityRef(r.targetRef).name);
            try {
                const response = await catalogApi.getEntities({
                    fields: [CATALOG_METADATA_API_NAME, CATALOG_METADATA_API_VERSION, CATALOG_SPEC_SYSTEM],
                    filter: {
                        kind: ['API'],
                        'metadata.name': targetNames,
                    },
                });
                relatedEntities.push(...response.items);
            } catch (fetchError) {
                // Continue with local entities even if default fetch fails
            }
        }

        localRelations.forEach(r => {
            const name = parseEntityRef(r.targetRef).name;
            relatedEntities.push(createLocalEntity(name));
        });

        return relatedEntities;
    }, [entity, dependency, catalogApi]);

    const title = dependency === 'consumed' ? 'Consumed APIs' : 'Provided APIs';
    const rows = useMemo(() => entities.map(toRow), [entities]);


    const tableTitle = useMemo(() => (
        <Flex align="center" mr='1'>
            {title} ({rows.length})
        </Flex>
    ), [title, rows.length]);

    if (error) {
        return <ResponseErrorPanel title="Error" error={error} />;
    }

    return (
        <Table<TableRow>
            isLoading={loading}
            columns={serviceColumns}
            options={tableOptions}
            title={tableTitle}
            data={rows}
        />
    );
});