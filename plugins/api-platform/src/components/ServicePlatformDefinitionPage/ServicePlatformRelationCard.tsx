import { Link, ResponseErrorPanel, Table, TableColumn } from "@backstage/core-components";
import { memo, useCallback, useMemo } from 'react';
import { ServicePlatformDisplayName } from "../ServicePlatformTable/ServicePlatformDisplayName";
import { Box } from "@material-ui/core";
import { Entity, parseEntityRef, RELATION_CONSUMES_API, RELATION_PROVIDES_API } from "@backstage/catalog-model";
import { CatalogApi, catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import { useApi } from "@backstage/core-plugin-api";
import useAsync from 'react-use/esm/useAsync';
import { ANNOTATION_API_NAME, ANNOTATION_API_VERSION, CATALOG_METADATA_API_NAME, CATALOG_METADATA_API_VERSION, } from "@internal/plugin-api-platform-common";

type TableRow = {
    id: number,
    data: {
        name: string,
        version: string,
    },
}

const serviceColumns: TableColumn<TableRow>[] = [
    {
        title: 'Name',
        width: '60%',
        field: 'name',
        highlight: true,
        defaultSort: 'asc',
        render: ({ data }: any) => {
            return (
                <Link to={`/api-platform/api/${data.name}?version=${data.version}`}>
                    <ServicePlatformDisplayName
                        text={`${data.name}`}
                    />
                </Link>
            );
        },
    }, {
        title: 'Version',
        width: '40%',
        field: 'data.version',
    },
];

const toRow = (entity: Entity, idx: number): TableRow => ({
    id: idx,
    data: {
        name: entity.metadata[ANNOTATION_API_NAME]?.toString() ?? '?',
        version: entity.metadata[ANNOTATION_API_VERSION]?.toString() ?? '?',
    },
});

const fetchEntities = async (catalogApi: CatalogApi, serviceEntity: Entity, dependency: 'provided' | 'consumed') => {
    const relationType = dependency === 'consumed' ? RELATION_CONSUMES_API : RELATION_PROVIDES_API;
    const relations = serviceEntity.relations?.filter(relation => relation.type === relationType) ?? [];

    if (relations.length === 0) {
        return [];
    }

    const targetNames = relations.map(relation => parseEntityRef(relation.targetRef).name);

    try {
        const response = await catalogApi.getEntities({
            fields: [
                CATALOG_METADATA_API_NAME,
                CATALOG_METADATA_API_VERSION,
            ],
            filter: {
                kind: ['API'],
                'metadata.name': targetNames,
            },
        });

        return response.items;
    } catch (error) {
        throw error;
    }
};

interface ServicePlatformRelationCardProps {
    dependency: 'provided' | 'consumed';
}

export const ServicePlatformRelationCard = memo<ServicePlatformRelationCardProps>(({ dependency }) => {
    const { entity } = useEntity();
    const catalogApi = useApi(catalogApiRef);

    const title = useMemo(() =>
        dependency === 'consumed' ? 'Consumed APIs' : 'Provided APIs',
        [dependency]
    );

    const fetchAsync = useCallback(
        () => fetchEntities(catalogApi, entity, dependency),
        [catalogApi, entity, dependency]
    );
    const { value: entities, loading, error } = useAsync(fetchAsync, [fetchAsync]);

    const rows = useMemo(() => entities?.map(toRow) || [], [entities]);

    const tableOptions = useMemo(() => ({
        search: true,
        padding: 'dense' as const,
        paging: false,
        draggable: false,
        thirdSortClick: false,
    }), []);

        const tableTitle = useMemo(() => (
        <Box display="flex" alignItems="center">
            <Box mr={1} />
            {title} ({rows.length})
        </Box>
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