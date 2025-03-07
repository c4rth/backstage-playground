import { Link, Table, TableColumn } from "@backstage/core-components";
import React from 'react';
import { ApiPlatformDisplayName } from "../ApiPlatformTable";
import { ServicePlatformDisplayName } from "../ServicePlatformTable/ServicePlatformDisplayName";
import { Box } from "@material-ui/core";

type TableRow = {
    id: number,
    data: {
        name: string,
    },
}

const apiColumns: TableColumn<TableRow>[] = [
    {
        title: 'Name',
        width: '100%',
        field: 'name',
        highlight: true,
        render: ({ data }: any) => {
            return (
                <Link to={`/api-platform/api/${data.name}`}>
                    <ApiPlatformDisplayName
                        text={data.name}
                    />
                </Link>
            );
        },
    },
];

const serviceColumns: TableColumn<TableRow>[] = [
    {
        title: 'Name',
        width: '100%',
        field: 'name',
        highlight: true,
        render: ({ data }: any) => {
            return (
                <Link to={`/api-platform/service/${data.name}`}>
                    <ServicePlatformDisplayName
                        text={data.name}
                    />
                </Link>
            );
        },
    },
];

export const SystemPlatformRelationCard = (props: { dependency: 'api' | 'service', data: string[] }) => {
    const { dependency, data } = props;

    const rows: TableRow[] = data.map(toRow);
    let title: string;
    let columns: TableColumn<TableRow>[];
    if (dependency === 'api') {
        title = "APIs";
        columns = apiColumns;
    } else {
        title = "Services";
        columns = serviceColumns;
    }
    const showPagination = rows.length > 20 || false;
    return (
        <Table<TableRow>
            columns={columns}
            options={{
                search: true,
                padding: 'dense',
                paging: showPagination,
                pageSize: 20,
            }}
            title={
                <Box display="flex" alignItems="center">
                    <Box mr={1} />
                    {title} ({rows ? rows.length : 0})
                </Box>
            }
            data={rows}
        />
    );
}

function toRow(item: string, idx: number) {
    return {
        id: idx,
        data: {
            name: item
        }
    };
}