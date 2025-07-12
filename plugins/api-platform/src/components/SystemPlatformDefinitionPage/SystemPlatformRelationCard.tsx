import { Link, Table, TableColumn } from "@backstage/core-components";
import { ApiPlatformDisplayName } from "../ApiPlatformTable";
import { ServicePlatformDisplayName } from "../ServicePlatformTable/ServicePlatformDisplayName";
import { Box } from "@material-ui/core";
import { memo, useMemo } from 'react';

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

const DEFAULT_PAGE_SIZE = 20;

const toRow = (item: string, idx: number): TableRow => ({
    id: idx,
    data: {
        name: item,
    },
});

interface SystemPlatformRelationCardProps {
    dependency: 'api' | 'service';
    data: string[];
}

export const SystemPlatformRelationCard = memo<SystemPlatformRelationCardProps>(({ dependency, data }) => {

    const computedValues = useMemo(() => {
        const isApi = dependency === 'api';
        return {
            isApi,
            title: isApi ? 'APIs' : 'Services',
            columns: isApi ? apiColumns : serviceColumns,
        };
    }, [dependency]);

    const rows = useMemo(() => data.map(toRow), [data]);
    const showPagination = useMemo(() => rows.length > DEFAULT_PAGE_SIZE, [rows.length]);

    const tableOptions = useMemo(() => ({
        search: true,
        padding: 'dense' as const,
        paging: showPagination,
        pageSize: DEFAULT_PAGE_SIZE,
        draggable: false,
        thirdSortClick: false,
    }), [showPagination]);

    const tableTitle = useMemo(() => (
        <Box display="flex" alignItems="center">
            <Box mr={1} />
            {computedValues.title} ({rows.length})
        </Box>
    ), [computedValues.title, rows.length]);

    return (
        <Table<TableRow>
            columns={computedValues.columns}
            options={tableOptions}
            title={tableTitle}
            data={rows}
        />
    );
});