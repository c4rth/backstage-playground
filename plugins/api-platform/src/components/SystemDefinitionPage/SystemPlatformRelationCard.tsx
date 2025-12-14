import { Link, Table, TableColumn } from "@backstage/core-components";
import { Flex } from "@backstage/ui";
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
const libraryColumns: TableColumn<TableRow>[] = [
    {
        title: 'Name',
        width: '100%',
        field: 'name',
        highlight: true,
        defaultSort: 'asc',
        render: ({ name, system }: TableRow) => {
            return (
                <Link to={`/api-platform/library/${system}/${name}`}>
                    <ComponentDisplayName type="library" text={name}
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
    dependency: 'api' | 'service' | 'library';
    data: string[];
}

export const SystemRelationCard = memo<SystemPlatformRelationCardProps>(({ system, dependency, data }) => {

    const computedValues = useMemo(() => {
        const isApi = dependency === 'api';
        const isLibrary = dependency === 'library';
        let columns: TableColumn<TableRow>[];
        let title: string;        
        if (isApi) {
            columns = apiColumns;
            title = 'APIs';
        } else if (isLibrary) {
            columns = libraryColumns;
            title = 'Libraries';
        } else {
            columns = serviceColumns;
            title = 'Services';
        }        
        return {
            isApi,
            isLibrary,
            title,
            columns,
        };
    }, [dependency]);

    const rows = useMemo(() => data.map((item, idx) => toRow(item, idx, system)), [data, system]);
    const showPagination = useMemo(() => rows.length > DEFAULT_PAGE_SIZE, [rows.length]);

    const tableOptions = useMemo(() => ({
        search: false,
        padding: 'dense' as const,
        paging: showPagination,
        pageSize: DEFAULT_PAGE_SIZE,
        draggable: false,
        thirdSortClick: false,
    }), [showPagination]);

    const tableTitle = useMemo(() => (
        <Flex align='center'>
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