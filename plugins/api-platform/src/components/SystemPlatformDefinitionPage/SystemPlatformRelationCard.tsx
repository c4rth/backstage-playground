import { Link, Table, TableColumn } from "@backstage/core-components";
import { ApiPlatformDisplayName } from "../ApiPlatformTable";
import { ServicePlatformDisplayName } from "../ServicePlatformTable/ServicePlatformDisplayName";
import { Box } from "@material-ui/core";
import { useMemo } from 'react';

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
        defaultSort: 'asc',
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
        defaultSort: 'asc',
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

    const rows = useMemo(() => data.map(toRow), [data]);
    const isApi = dependency === 'api';
    const title = isApi ? 'APIs' : 'Services';
    const columns = isApi ? apiColumns : serviceColumns;
    const showPagination = rows.length > 20;

    return (
        <Table<TableRow>
            columns={columns}
            options={{
                search: true,
                padding: 'dense',
                paging: showPagination,
                pageSize: 20,
                draggable: false,
                thirdSortClick: false,
            }}
            title={
                <Box display="flex" alignItems="center">
                    <Box mr={1} />
                    {title} ({rows.length})
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