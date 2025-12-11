import { Link, ResponseErrorPanel, Table, TableColumn } from "@backstage/core-components";
import { memo, useCallback, useMemo } from 'react';
import { Entity, parseEntityRef, RELATION_API_CONSUMED_BY, RELATION_API_PROVIDED_BY } from "@backstage/catalog-model";
import { CatalogApi, catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import { useApi } from "@backstage/core-plugin-api";
import useAsync from 'react-use/esm/useAsync';
import { ANNOTATION_SERVICE_NAME, ANNOTATION_SERVICE_VERSION, CATALOG_METADATA_SERVICE_NAME, CATALOG_METADATA_SERVICE_VERSION, CATALOG_SPEC_LIFECYCLE, CATALOG_SPEC_SYSTEM } from "@internal/plugin-api-platform-common";
import { ComponentDisplayName } from "../common";
import { Flex } from '@backstage/ui';

type TableRow = {
    id: number,
    system: string,
    name: string,
    version: string,
    environment: string,
}

const serviceColumns: TableColumn<TableRow>[] = [
    {
        title: 'Name',
        width: '50%',
        field: 'name',
        highlight: true,
        defaultSort: 'asc',
        render: ({ system, name, version, environment }: TableRow) => {
            return (
                <Link to={`/api-platform/service/${system}/${name}?version=${version}&env=${environment}`}>
                    <ComponentDisplayName text={name} type="service" />
                </Link>
            );
        },
    }, 
    {
        title: 'Version',
        width: '20%',
        field: 'version',
    }, 
    {
        title: 'Environment',
        width: '15%',
        field: 'environment',
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
    system: entity.spec?.system?.toString() ?? '?',
    name: entity.metadata[ANNOTATION_SERVICE_NAME]?.toString() ?? '?',
    version: entity.metadata[ANNOTATION_SERVICE_VERSION]?.toString() ?? '?',
    environment: entity.spec?.lifecycle?.toString().toUpperCase() ?? '?',
});

const fetchEntities = async (catalogApi: CatalogApi, entity: Entity, dependency: 'provider' | 'consumer') => {
    const relationType = dependency === 'consumer' ? RELATION_API_CONSUMED_BY : RELATION_API_PROVIDED_BY;
    const relations = entity.relations?.filter(relation => relation.type === relationType) ?? [];

    if (relations.length === 0) {
        return [];
    }

    const targetNames = relations.map(relation => parseEntityRef(relation.targetRef).name);

    try {
        const response = await catalogApi.getEntities({
            fields: [
                CATALOG_METADATA_SERVICE_NAME,
                CATALOG_METADATA_SERVICE_VERSION,
                CATALOG_SPEC_SYSTEM,
                CATALOG_SPEC_LIFECYCLE,
            ],
            filter: {
                kind: ['Component'],
                'spec.type': ['service'],
                'metadata.name': targetNames,
            },
        });

        return response.items;
    } catch (error) {
        throw error;
    }
};

const tableOptions = {
    search: true,
    padding: 'dense' as const,
    paging: false,
    draggable: false,
    thirdSortClick: false,
};

interface ApiRelationCardProps {
    dependency: 'provider' | 'consumer';
}

export const ApiRelationCard = memo<ApiRelationCardProps>(({ dependency }) => {
    const { entity } = useEntity();
    const catalogApi = useApi(catalogApiRef);
    const title = useMemo(() =>
        dependency === 'consumer' ? 'Consumers' : 'Providers',
        [dependency]
    );
    const fetchAsync = useCallback(
        () => fetchEntities(catalogApi, entity, dependency),
        [catalogApi, entity, dependency]
    );
    const { value: entities, loading, error } = useAsync(fetchAsync, [fetchAsync]);
    const rows = useMemo(() => entities?.map(toRow) ?? [], [entities]);
    const tableTitle = useMemo(() => (
        <Flex align="center">
            {title} ({rows.length})
        </Flex>
    ), [title, rows.length]);

    if (error) {
        return <ResponseErrorPanel title={`Error loading ${title.toLowerCase()}`} error={error} />;
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