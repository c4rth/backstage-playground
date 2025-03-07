import { Link, Progress, ResponseErrorPanel, Table, TableColumn } from "@backstage/core-components";
import React, { useCallback } from 'react';
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
        render: ({ data }: any) => {
            return (
                <Link to={`/api-platform/api/${data.name}?version=${data.version}`}>
                    <ServicePlatformDisplayName
                        text={`${data.name}`}
                    />
                </Link>
            );
        },
    },{
        title: 'Version',
        width: '40%',
        field: 'data.version',
    },
];

const fetchEntities = async (catalogApi: CatalogApi, serviceEntity: Entity, dependency: 'provided' | 'consumed') => {
    const type = dependency === 'consumed' ? RELATION_CONSUMES_API : RELATION_PROVIDES_API;
    const filteredRelations = serviceEntity.relations?.filter((relation) => relation.type === type) || [];
    const filteredNames = filteredRelations.map((relation) => parseEntityRef(relation.targetRef).name);
    if (filteredNames.length === 0) {
        return [];
    }
    const response = await catalogApi.getEntities({
        fields: [
            CATALOG_METADATA_API_NAME,
            CATALOG_METADATA_API_VERSION,
        ],
        filter: {
            kind: ['API'],
            'metadata.name': filteredNames
        },
    });
    return response.items;
};

export const ServicePlatformRelationCard = (props: { dependency: 'provided' | 'consumed' }) => {
    const { dependency } = props;
    const { entity } = useEntity();
    const catalogApi = useApi(catalogApiRef);

    const title = dependency === 'consumed' ? 'Consumed APIs' : 'Provided APIs';

    const fetchAsync = useCallback(() => fetchEntities(catalogApi, entity, dependency), [catalogApi, entity, dependency]);
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
            name: entity.metadata[ANNOTATION_API_NAME]?.toString() || '?',
            version: entity.metadata[ANNOTATION_API_VERSION]?.toString() || '?',
        }
    };
}