import { Link, ResponseErrorPanel, Table, TableColumn } from "@backstage/core-components";
import { memo, useMemo } from 'react';
import { Flex } from "@backstage/ui";
import { Entity, parseEntityRef, RELATION_DEPENDS_ON } from "@backstage/catalog-model";
import { catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import { useApi } from "@backstage/core-plugin-api";
import useAsync from 'react-use/esm/useAsync';
import {
    ANNOTATION_LIBRARY_NAME,
    ANNOTATION_LIBRARY_VERSION,
    CATALOG_METADATA_LIBRARY_NAME,
    CATALOG_METADATA_LIBRARY_VERSION,
    CATALOG_SPEC_SYSTEM,
} from "@internal/plugin-api-platform-common";
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
        render: ({ system, name }: TableRow) => {
            return (
                <Link to={`/api-platform/library/${system}/${name}`}>
                    <ComponentDisplayName text={name} type="library" />
                </Link>
            );
        },
    },
    {
        title: 'Version',
        width: '35%',
        field: 'version',
        highlight: true,
        render: ({ system, name, version }: TableRow) => {
            return (
                <Link to={`/api-platform/library/${system}/${name}?version=${version}`}>
                    <ComponentDisplayName text={version} type="library" />
                </Link>
            );
        },
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
    name: entity.metadata[ANNOTATION_LIBRARY_NAME]?.toString() ?? '?',
    version: entity.metadata[ANNOTATION_LIBRARY_VERSION]?.toString() ?? '?',
    system: entity.spec?.system?.toString() ?? '-',
});

const tableOptions = {
    search: true,
    padding: 'dense' as const,
    paging: false,
    draggable: false,
    thirdSortClick: false,
};
interface ServiceApiRelationCardProps {
}

export const ServiceLibraryRelationCard = memo<ServiceApiRelationCardProps>(() => {
    const { entity } = useEntity();
    const catalogApi = useApi(catalogApiRef);

    const { value: entities = [], loading, error } = useAsync(async () => {
        const allRelations = entity.relations?.filter(r => r.type === RELATION_DEPENDS_ON) ?? [];

        if (allRelations.length === 0) return [];

        const relatedEntities: Entity[] = [];

        const targetNames = allRelations.map(r => parseEntityRef(r.targetRef).name);
        try {
            const response = await catalogApi.getEntities({
                fields: [CATALOG_METADATA_LIBRARY_NAME, CATALOG_METADATA_LIBRARY_VERSION, CATALOG_SPEC_SYSTEM],
                filter: {
                    kind: ['Component'],
                    'spec.type': ['library'],
                    'metadata.name': targetNames,
                },
            });
            relatedEntities.push(...response.items);
        } catch (fetchError) {
            // Continue with local entities even if default fetch fails
        }

        return relatedEntities;
    }, [entity, catalogApi]);

    const rows = useMemo(() => entities.map(toRow), [entities]);


    const tableTitle = useMemo(() => (
        <Flex align="center">
            Libraries ({rows.length})
        </Flex>
    ), [rows.length]);

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