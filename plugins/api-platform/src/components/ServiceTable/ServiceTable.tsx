import {
    Link,
    Progress,
    ResponseErrorPanel,
    Table,
    TableColumn,
} from '@backstage/core-components';
import { ServiceChip } from '../common';
import { OwnershipType, ServiceDefinition, ServiceDefinitionsListRequest } from '@internal/plugin-api-platform-common';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { ComponentDisplayName, ComponentOwnership } from '../common';
import { useApi } from '@backstage/core-plugin-api';
import { ApiPlatformBackendApi, apiPlatformBackendApiRef } from '../../api/ApiPlatformBackendApi';
import { Box, Flex, Text } from '@backstage/ui';
import { ListBox, ListBoxItem } from 'react-aria-components';

// TODO-MUI
import { Query } from '@material-table/core';

type TableRow = {
    id: number;
    name: string;
    system: string;
    serviceDefinition: ServiceDefinition;
};

const PAGE_SIZE = 20;
const STORAGE_OWNERSHIP_KEY = 'servicesTablePageOwner';
const STORAGE_SEARCH_KEY = 'servicesTablePageSearch';

const LIST_ITEM_STYLE = {
    margin: 2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '2.5rem',
};
const EMPTY_STATE_STYLE = { pointerEvents: 'none' as const };

const toRow = (serviceDefinition: ServiceDefinition, idx: number): TableRow => ({
    id: idx,
    name: serviceDefinition.name,
    system: serviceDefinition.system,
    serviceDefinition,
});

const renderVersionList = (serviceDefinition: ServiceDefinition, renderItem: (version: any, idx: number) => JSX.Element) => (
    <ListBox>
        {serviceDefinition.versions?.map((version, idx) => (
            <Fragment key={`${serviceDefinition.name}-${version.version}-${idx}`}>
                <ListBoxItem style={LIST_ITEM_STYLE}>{renderItem(version, idx)}</ListBoxItem>
            </Fragment>
        ))}
    </ListBox>
);

const createEnvironmentColumn = (env: string): TableColumn<TableRow> => ({
    title: env.toUpperCase(),
    width: '12%',
    align: 'center',
    cellStyle: { padding: 0 },
    sorting: false,
    searchable: true,
    customFilterAndSearch: (query, row) => {
        if (!row.serviceDefinition?.versions) return false;
        const lowerQuery = query.toLowerCase();
        return row.serviceDefinition.versions.some(version => {
            const envData = version.environments[env as keyof typeof version.environments];
            return envData?.imageVersion.toLowerCase().includes(lowerQuery);
        });
    },
    render: ({ serviceDefinition }) =>
        renderVersionList(serviceDefinition, (version, idx) =>
            env in version.environments ? (
                <ServiceChip
                    index={idx}
                    service={version.environments[env as keyof typeof version.environments]}
                    link={`/api-platform/service/${serviceDefinition.system}/${serviceDefinition.serviceName}?version=${version.version}&env=${env}`}
                />
            ) : (
                <div style={EMPTY_STATE_STYLE}>
                    <Text variant="body-medium">-</Text>
                </div>
            )
        ),
});

const COLUMNS: TableColumn<TableRow>[] = [
    {
        title: 'Name',
        width: '25%',
        field: 'name',
        highlight: true,
        defaultSort: 'asc',
        render: ({ serviceDefinition }) => (
            <Link to={`/api-platform/service/${serviceDefinition.system}/${serviceDefinition.serviceName}`}>
                <ComponentDisplayName text={serviceDefinition.serviceName} type="service" />
            </Link>
        ),
    },
    {
        title: 'Versions',
        width: '5%',
        field: 'version',
        sorting: false,
        align: 'center',
        cellStyle: { padding: 0 },
        render: ({ serviceDefinition }) =>
            renderVersionList(serviceDefinition, (version, idx) => (
                <ServiceChip
                    index={idx}
                    text={version.version}
                    link={`/api-platform/service/${serviceDefinition.system}/${serviceDefinition.serviceName}?version=${version.version}`}
                />
            )),
    },
    createEnvironmentColumn('tst'),
    createEnvironmentColumn('gtu'),
    createEnvironmentColumn('uat'),
    createEnvironmentColumn('ptp'),
    createEnvironmentColumn('prd'),
    {
        title: 'System',
        width: '10%',
        highlight: true,
        field: 'system',
        render: ({ serviceDefinition }) => (
            <Link to={`/api-platform/system/${serviceDefinition.system}`}>
                <ComponentDisplayName text={serviceDefinition.system} type="system" />
            </Link>
        ),
    },
];

const getData = async (
    apiPlatformApi: ApiPlatformBackendApi,
    query: Query<TableRow>,
    ownership: OwnershipType
) => {
    const page = query.page ?? 0;
    const pageSize = query.pageSize ?? PAGE_SIZE;

    const result = await apiPlatformApi.listServices({
        offset: page * pageSize,
        limit: pageSize,
        search: query.search,
        orderBy: query.orderBy
            ? {
                field: query.orderBy.field,
                direction: query.orderDirection,
            } as ServiceDefinitionsListRequest['orderBy']
            : undefined,
        ownership,
    });

    return result
        ? {
            data: result.items.map(toRow),
            totalCount: result.totalCount,
            page: Math.floor(result.offset / result.limit),
        }
        : {
            data: [],
            totalCount: 0,
            page: 0,
        };
};

export const ServiceTable = () => {
    const apiPlatformApi = useApi(apiPlatformBackendApiRef);
    const [countRows, setCountRows] = useState(0);
    const [loadingCount, setLoadingCount] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [ownership, setOwnership] = useState<OwnershipType>(
        () => (sessionStorage.getItem(STORAGE_OWNERSHIP_KEY) === 'owned' ? 'owned' : 'all')
    );

    const initialSearch = useMemo(() => sessionStorage.getItem(STORAGE_SEARCH_KEY) ?? '', []);

    const tableOptions = useMemo(
        () => ({
            search: true,
            padding: 'dense' as const,
            pageSize: PAGE_SIZE,
            pageSizeOptions: [10, PAGE_SIZE, 50],
            showEmptyDataSourceMessage: !loadingCount,
            draggable: false,
            thirdSortClick: false,
            searchText: initialSearch,
        }),
        [loadingCount, initialSearch]
    );

    const tableTitle = useMemo(
        () => (
            <Flex gap="0" align="center">
                <Box mr="1" />
                {ownership === 'owned' ? 'Owned' : 'All'} Services ({countRows})
                <Box ml="4" />
                <ComponentOwnership storageKey={STORAGE_OWNERSHIP_KEY} handleOwnershipChange={setOwnership} />
            </Flex>
        ),
        [countRows, ownership]
    );

    useEffect(() => {
        let isMounted = true;

        const fetchCount = async () => {
            setLoadingCount(true);
            setError(null);
            try {
                const count = await apiPlatformApi.getServicesCount(ownership);
                if (isMounted) {
                    setCountRows(count);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err as Error);
                }
            } finally {
                if (isMounted) {
                    setLoadingCount(false);
                }
            }
        };

        fetchCount();

        return () => {
            isMounted = false;
        };
    }, [apiPlatformApi, ownership]);

    const fetchData = useCallback(
        async (query: Query<TableRow>) => {
            if (query.search !== undefined) {
                sessionStorage.setItem(STORAGE_SEARCH_KEY, query.search);
            }
            return getData(apiPlatformApi, query, ownership);
        },
        [apiPlatformApi, ownership]
    );

    if (loadingCount) return <Progress />;
    if (error) return <ResponseErrorPanel error={error} />;

    return (
        <Table<TableRow>
            isLoading={loadingCount}
            columns={COLUMNS}
            options={tableOptions}
            title={tableTitle}
            data={fetchData}
        />
    );
};