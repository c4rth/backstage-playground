import { Link, Table, TableColumn } from "@backstage/core-components";
import { Box, Flex } from "@backstage/ui";
import { memo, useMemo } from 'react';
import { ComponentDisplayName } from "../common";

type TableRow = {
    id: number,
    name: string,
    system: string,
}

const apiColumns: TableColumn<TableRow>[] = [
    {
        title: 'Name',
        width: '100%',
        field: 'name',
        highlight: true,
        defaultSort: 'asc',
        render: ({ name, system }: TableRow) => {
            return (
                <Link to={`/api-platform/api/${system}/${name}`}>
                    <ComponentDisplayName type="api" text={name} />
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
        render: ({ name, system }: TableRow) => {
            return (
                <Link to={`/api-platform/service/${system}/${name}`}>
                    <ComponentDisplayName type="service" text={name}
                    />
                </Link>
            );
        },
    },
];

const DEFAULT_PAGE_SIZE = 20;

const toRow = (item: string, idx: number, system: string): TableRow => ({
    id: idx,
    name: item,
    system: system,
});

interface SystemPlatformRelationCardProps {
    system: string;
    dependency: 'api' | 'service';
    data: string[];
}

export const SystemPlatformRelationCard = memo<SystemPlatformRelationCardProps>(({ system, dependency, data }) => {

    const computedValues = useMemo(() => {
        const isApi = dependency === 'api';
        return {
            isApi,
            title: isApi ? 'APIs' : 'Services',
            columns: isApi ? apiColumns : serviceColumns,
        };
    }, [dependency]);

    const rows = useMemo(() => data.map((item, idx) => toRow(item, idx, system)), [data, system]);
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
        <Flex align='center'>
            <Box mr='1' />
            {computedValues.title} ({rows.length})
        </Flex>
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