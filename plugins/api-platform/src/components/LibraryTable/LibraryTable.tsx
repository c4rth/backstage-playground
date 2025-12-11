import {
    Link,
    ResponseErrorPanel,
    Table,
    TableColumn,
} from '@backstage/core-components';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { Box, Flex } from '@backstage/ui';
import { useCallback, useMemo, useState } from 'react';
import { ComponentDisplayName, ComponentOwnership } from '../common';
import { useApi } from '@backstage/core-plugin-api';
import { ApiPlatformBackendApi, apiPlatformBackendApiRef } from '../../api/ApiPlatformBackendApi';
import { Query } from '@material-table/core';
import { OwnershipType, LibraryDefinitionsListRequest, ANNOTATION_LIBRARY_NAME, ANNOTATION_LIBRARY_VERSION } from '@internal/plugin-api-platform-common';

type TableRow = {
    id: number,
    name: string,
    description: string,
    latestVersion: string,
    entityRef: string,
    system: string,
}

const columns: TableColumn<TableRow>[] = [
    {
        title: 'Name',
        width: '25%',
        field: 'name',
        highlight: true,
        defaultSort: 'asc',
        render: ({ name, system }: TableRow) => (
            <Link to={`/api-platform/library/${system}/${name}`}>
                <ComponentDisplayName text={name} type="library" />
            </Link>
        ),
    },
    {
        title: 'Latest Version',
        width: '15%',
        field: 'latestVersion',
        render: ({ latestVersion }: TableRow) => latestVersion || '-',
    },
    {
        title: 'Description',
        width: '50%',
        field: 'description',
        render: ({ description }: TableRow) => description || '-',
    },
    {
        title: 'System',
        width: '10%',
        field: 'system',
        highlight: true,
        render: ({ system }: TableRow) =>
            system === '-' ? (
                <ComponentDisplayName text={system} type="system" />
            ) : (
                <Link to={`/api-platform/system/${system}`}>
                    <ComponentDisplayName text={system} type="system" />
                </Link>
            ),
    },
];

const PAGE_SIZE = 20;

const toEntityRow = (entity: Entity, idx: number): TableRow => {
    return {
        id: idx,
        name: entity.metadata[ANNOTATION_LIBRARY_NAME]?.toString() ?? '?',
        description: entity.metadata.description ?? '',
        entityRef: stringifyEntityRef(entity),
        latestVersion: entity.metadata[ANNOTATION_LIBRARY_VERSION]?.toString() ?? '-',
        system: entity.spec?.system?.toString() ?? '-',
    };
};

async function getData(apiPlatformApi: ApiPlatformBackendApi, ownership: OwnershipType, query: Query<TableRow>) {
    const page = query.page ?? 0;
    const pageSize = query.pageSize ?? PAGE_SIZE;
    const result = await apiPlatformApi.listLibraries({
        offset: page * pageSize,
        limit: pageSize,
        search: query.search,
        orderBy: query.orderBy ? {
            field: query.orderBy.field,
            direction: query.orderDirection,
        } as LibraryDefinitionsListRequest['orderBy'] : undefined,
        ownership: ownership,
    });
    if (result) {
        return {
            data: result.items.map(toEntityRow),
            totalCount: result.totalCount,
            page: Math.floor(result.offset / result.limit),
        };
    }
    return {
        data: [],
        totalCount: 0,
        page: 0,
    };
}

interface LibraryTableProps {

}

const STORAGE_OWNERSHIP_KEY = 'librariesTablePageOwner';
const STORAGE_SEARCH_KEY = 'librariesTablePageSearch';

export const LibraryTable = ({ }: LibraryTableProps) => {
    const apiPlatformApi = useApi(apiPlatformBackendApiRef);
    const initialSearch = sessionStorage.getItem(STORAGE_SEARCH_KEY) ?? '';
    const [error, setError] = useState<Error | null>(null);

    const [ownership, setOwnership] = useState<OwnershipType>(
        () => (sessionStorage.getItem(STORAGE_OWNERSHIP_KEY) === 'owned' ? 'owned' : 'all')
    );

    const tableOptions = useMemo(() => ({
        search: true,
        padding: 'dense' as const,
        pageSize: PAGE_SIZE,
        pageSizeOptions: [10, PAGE_SIZE, 50],
        draggable: false,
        thirdSortClick: false,
        searchText: initialSearch,
    }), [initialSearch]);

    const tableTitle = useMemo(() => (
        <Flex gap="0" align="center">
            <Box mr='1' />
            {ownership === 'owned' ? 'Owned' : 'All'} Libraries
            <Box ml='2' />
            <ComponentOwnership storageKey={STORAGE_OWNERSHIP_KEY} handleOwnershipChange={setOwnership} />
        </Flex>
    ), [ownership]);

    const fetchData = useCallback(
        async (query: Query<TableRow>) => {
            try {
                if (query.search !== undefined) {
                    sessionStorage.setItem(STORAGE_SEARCH_KEY, query.search);
                }
                return getData(apiPlatformApi, ownership, query);
            } catch (err) {
                setError(err as Error);
                return { data: [], page: 0, totalCount: 0 };
            }
        },
        [apiPlatformApi, ownership]
    );

    if (error) {
        return <ResponseErrorPanel error={error} />;
    }

    if (error) return <ResponseErrorPanel error={error} />;

    return (
        <Table<TableRow>
            columns={columns}
            options={tableOptions}
            title={tableTitle}
            data={fetchData}
            key={ownership}
        />
    );
};