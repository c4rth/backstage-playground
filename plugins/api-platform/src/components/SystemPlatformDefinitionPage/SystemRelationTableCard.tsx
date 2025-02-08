import { Link, Table, TableColumn } from "@backstage/core-components";
import { SystemDefinition } from "@internal/plugin-api-platform-common";
import React from 'react';
import { ApiPlatformDisplayName } from "../ApiPlatformTable";
import { ServicePlatformDisplayName } from "../ServicePlatformTable/ServicePlatformDisplayName";
import { Box } from "@material-ui/core";

const apiColumns: TableColumn[] = [
    {
        title: 'Name',
        width: '100%%',
        field: 'name',
        highlight: true,
        render: ({ data }: any) => {
            return (
                <Link to={`/api-platform/api/${data.name}`}>
                    <ApiPlatformDisplayName
                        name={data.name}
                    />
                </Link>
            );
        },
    },
];

const serviceColumns: TableColumn[] = [
    {
        title: 'Name',
        width: '100%%',
        field: 'name',
        highlight: true,
        render: ({ data }: any) => {
            return (
                <Link to={`/api-platform/service/${data.name}`}>
                    <ServicePlatformDisplayName
                        name={data.name}
                    />
                </Link>
            );
        },
    },
];

export const SystemRelationTableCard = (props: { dependency: 'api' | 'service', systemDefinition: SystemDefinition }) => {
    const { dependency, systemDefinition } = props;

    let rows: any[];
    let title: string;
    let columns: TableColumn[];
    if (dependency === 'api') {
        rows = systemDefinition?.apis.map(toRow);
        title = "APIs";
        columns = apiColumns;
    } else if (dependency === 'service') {
        rows = systemDefinition?.services.map(toRow);
        title = "Services";
        columns = serviceColumns;
    } else {
        return (<></>);
    }
    return (
        <Table
            columns={columns}
            options={{
                search: true,
                padding: 'dense',
                paging: true,
                pageSize: 15,
            }}
            title={
                <Box display="flex" alignItems="center">
                    <Box mr={1} />
                    {title} ({rows ? rows.length : 0})
                </Box>
            }
            data={rows ?? []}
        />
    );
}

function toRow(item: string) {
    return {
        data: {
            name: item
        }
    };
}