import {
    Link,
    Progress,
    ResponseErrorPanel,
    Table,
    TableColumn,
} from '@backstage/core-components';
import {
    EntityRefLinks,
} from '@backstage/plugin-catalog-react';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { Box, Flex } from '@backstage/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ComponentDisplayName, ComponentOwnership } from '../common';
import { useApi } from '@backstage/core-plugin-api';
import { ApiPlatformBackendApi, apiPlatformBackendApiRef } from '../../api/ApiPlatformBackendApi';
import { Query } from '@material-table/core';
import { SystemDefinitionsListRequest, OwnershipType } from '@internal/plugin-api-platform-common';

type TableRow = {
    id: number,
    name: string,
    description: string,
    entityRef: string,
    owner: string,
}

const columns: TableColumn<TableRow>[] = [
    {
        title: 'Name',
        width: '25%',
        field: 'name',
        highlight: true,
        defaultSort: 'asc',
        render: ({ name }: TableRow) => (
            <Link to={name}>
                <ComponentDisplayName text={name} type='system' />
            </Link>
        ),
    },
    {
        title: 'Description',
        width: '50%',
        field: 'description',
        render: ({ description }: TableRow) => description || '-',
    },
    {
        title: 'Owner',
        width: '25%',
        field: 'owner',
        render: ({ owner }: TableRow) => (
            <EntityRefLinks
                entityRefs={[owner]}
                defaultKind="group"
            />
        ),
    },
];

const PAGE_SIZE = 20;

const toEntityRow = (entity: Entity, idx: number): TableRow => {
    return {
        id: idx,
        name: entity.metadata.name ?? '?',
        description: entity.metadata.description ?? '',
        entityRef: stringifyEntityRef(entity),
        owner: entity.spec?.owner?.toString() ?? '-',
    };
};

async function getData(apiPlatformApi: ApiPlatformBackendApi, ownership: OwnershipType, query: Query<TableRow>) {
    const page = query.page ?? 0;
    const pageSize = query.pageSize ?? PAGE_SIZE;
    const result = await apiPlatformApi.listSystems({
        offset: page * pageSize,
        limit: pageSize,
        search: query.search,
        orderBy: query.orderBy ? {
            field: query.orderBy.field,
            direction: query.orderDirection,
        } as SystemDefinitionsListRequest['orderBy'] : undefined,
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

interface SystemPlatformTableProps {

}

const STORAGE_OWNERSHIP_KEY = 'systemsTablePageOwner';
const STORAGE_SEARCH_KEY = 'systemsTablePageSearch';

export const SystemPlatformTable = ({ }: SystemPlatformTableProps) => {
    const apiPlatformApi = useApi(apiPlatformBackendApiRef);
    const initialSearch = sessionStorage.getItem(STORAGE_SEARCH_KEY) ?? '';
    const [countRows, setCountRows] = useState<number>(0);
    const [loadingCount, setLoadingCount] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const [ownership, setOwnership] = useState<OwnershipType>(
        () => (sessionStorage.getItem(STORAGE_OWNERSHIP_KEY) === 'owned' ? 'owned' : 'all')
    );

    const tableOptions = useMemo(() => ({
        search: true,
        padding: 'dense' as const,
        pageSize: PAGE_SIZE,
        pageSizeOptions: [10, PAGE_SIZE, 50],
        showEmptyDataSourceMessage: !loadingCount,
        draggable: false,
        thirdSortClick: false,
        searchText: initialSearch,
    }), [loadingCount, initialSearch]);

    const tableTitle = useMemo(() => (
            <Flex gap="0" align="center">
            <Box mr='1' />
            {ownership === 'owned' ? 'Owned' : 'All'} Systems ({countRows})
            <Box ml='2' />
            <ComponentOwnership storageKey={STORAGE_OWNERSHIP_KEY} handleOwnershipChange={setOwnership} />
        </Flex>
    ), [ownership, countRows]);

    useEffect(() => {
        const fetchCount = async () => {
            setLoadingCount(true);
            setError(null);
            try {
                const count = await apiPlatformApi.getSystemsCount(ownership);
                setCountRows(count);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoadingCount(false);
            }
        };
        fetchCount();
    }, [ownership, apiPlatformApi]);

    const fetchData = useCallback(
        async (query: Query<TableRow>) => {
            if (query.search !== undefined) {
                sessionStorage.setItem(STORAGE_SEARCH_KEY, query.search);
            }
            return getData(apiPlatformApi, ownership, query);
        },
        [apiPlatformApi, ownership]
    );

    if (error) {
        return <ResponseErrorPanel error={error} />;
    }

    if (loadingCount) return <Progress />;
    if (error) return <ResponseErrorPanel error={error} />;

    return (
        <Table<TableRow>
            isLoading={loadingCount}
            columns={columns}
            options={tableOptions}
            title={tableTitle}
            data={fetchData}
        />
    );
};