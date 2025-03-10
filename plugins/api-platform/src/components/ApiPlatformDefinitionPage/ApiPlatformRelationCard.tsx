import { Link, Progress, ResponseErrorPanel, Table, TableColumn } from "@backstage/core-components";
import React, { useCallback } from 'react';
import { ServicePlatformDisplayName } from "../ServicePlatformTable/ServicePlatformDisplayName";
import { Box } from "@material-ui/core";
import { ApiEntity, Entity, parseEntityRef, RELATION_API_CONSUMED_BY, RELATION_API_PROVIDED_BY } from "@backstage/catalog-model";
import { CatalogApi, catalogApiRef } from '@backstage/plugin-catalog-react';
import { useApi } from "@backstage/core-plugin-api";
import useAsync from 'react-use/esm/useAsync';
import { ANNOTATION_SERVICE_NAME, ANNOTATION_SERVICE_VERSION, CATALOG_METADATA_SERVICE_NAME, CATALOG_METADATA_SERVICE_VERSION, CATALOG_SPEC_LIFECYCLE } from "@internal/plugin-api-platform-common";

type TableRow = {
    id: number,
    data: {
        name: string,
        version: string,
        environment: string,
    },
}

const serviceColumns: TableColumn<TableRow>[] = [
    {
        title: 'Name',
        width: '50%',
        field: 'name',
        highlight: true,
        render: ({ data }: any) => {
            return (
                <Link to={`/api-platform/service/${data.name}?version=${data.version}&env=${data.environment}`}>
                    <ServicePlatformDisplayName
                        name={data.name}
                    />
                </Link>
            );
        },
    }, {
        title: 'Version',
        width: '25%',
        field: 'data.version',
    }, {
        title: 'Environment',
        width: '25%',
        field: 'data.environment',
    },
];

const fetchEntities = async (catalogApi: CatalogApi, apiEntity: ApiEntity, dependency: 'provider' | 'consumer') => {

    const type = dependency === 'consumer' ? RELATION_API_CONSUMED_BY : RELATION_API_PROVIDED_BY;
    const filteredRelations = apiEntity.relations?.filter((relation) => relation.type === type) || [];
    const filteredNames = filteredRelations.map((relation) => parseEntityRef(relation.targetRef).name);
    if (filteredNames.length === 0) {
        return [];
    }
    const response = await catalogApi.getEntities({
        fields: [
            CATALOG_METADATA_SERVICE_NAME,
            CATALOG_METADATA_SERVICE_VERSION,
            CATALOG_SPEC_LIFECYCLE,
        ],
        filter: {
            kind: ['Component'],
            'spec.type': ['service'],
            'metadata.name': filteredNames
        },
    });
    return response.items;
};

export const ApiPlatformRelationCard = (props: { dependency: 'provider' | 'consumer', apiEntity: ApiEntity }) => {
    const { dependency, apiEntity } = props;
    const catalogApi = useApi(catalogApiRef);

    const title = dependency === 'consumer' ? 'Consumers' : 'Providers';

    const fetchAsync = useCallback(() => fetchEntities(catalogApi, apiEntity, dependency), [catalogApi, apiEntity, dependency]);
    const {
        value: entities,
        loading,
        error,
    } = useAsync(fetchAsync, [fetchAsync]);

    if (loading) {
        return <Progress />;
    }
    if (error) {
        return (
            <ResponseErrorPanel title="Error" error={error} />
        );
    }

    const rows = entities?.map(toRow) || [];

    return (
        <>
            <Table<TableRow>
                columns={serviceColumns}
                options={{
                    search: true,
                    padding: 'dense',
                    paging: false,
                }}
                title={
                    <Box display="flex" alignItems="center">
                        <Box mr={1} />
                        {title} ({rows ? rows.length : 0})
                    </Box>
                }
                data={rows}
            />
        </>
    );
}

function toRow(entity: Entity, idx: number) {
    return {
        id: idx,
        data: {
            name: entity.metadata[ANNOTATION_SERVICE_NAME]?.toString() || '?',
            version: entity.metadata[ANNOTATION_SERVICE_VERSION]?.toString() || '?',
            environment: entity.spec?.lifecycle?.toString().toUpperCase() || '?',
        }
    };
}