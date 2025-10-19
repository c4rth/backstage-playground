import {
    Link,
    Progress,
    ResponseErrorPanel,
    Table,
    TableColumn,
} from '@backstage/core-components';
import { ServicePlatformChip } from './ServicePlatformChip';
import { OwnershipType, ServiceDefinition, ServiceDefinitionsListRequest } from '@internal/plugin-api-platform-common';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { ComponentDisplayName, ComponentOwnership } from '../common';
import { useApi } from '@backstage/core-plugin-api';
import { apiPlatformBackendApiRef } from '../../api';
import { ApiPlatformBackendApi } from '../../api/ApiPlatformBackendApi';
import { Box, Flex, Text } from '@backstage/ui';

// TODO-MUI
import { Query } from '@material-table/core';
import { Divider, List, ListItem } from '@material-ui/core';

type TableRow = {
    id: number,
    name: string,
    system: string,
    serviceDefinition: ServiceDefinition,
}

const listStyle = { padding: '0px', margin: '0px' };
const listItemStyle = {
    margin: '2px',
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center" as const
};
const emptyStateStyle = { pointerEvents: 'none' as const };

function createEnvironmentColumn(env: string): TableColumn<TableRow> {
    return {
        title: env.toUpperCase(),
        width: '12%',
        align: 'center',
        cellStyle: { padding: '0px' },
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
        render: ({ serviceDefinition }) => {
            return (
                <List style={listStyle}>
                    {serviceDefinition.versions?.map((version, idx) => (
                        <Fragment key={`${serviceDefinition.name}-${version.version}-${idx}`}>
                            <ListItem style={listItemStyle}>
                                {env in version.environments ? (
                                    <ServicePlatformChip
                                        index={idx}
                                        service={version.environments[env as keyof typeof version.environments]}
                                        link={`/api-platform/service/${serviceDefinition.system}/${serviceDefinition.serviceName}?version=${version.version}&env=${env}`}
                                    />
                                ) : (
                                    <div style={emptyStateStyle}>
                                        <Text variant='body-medium'>-</Text>
                                    </div>
                                )}
                            </ListItem>
                            {idx < serviceDefinition.versions.length - 1 && <Divider />}
                        </Fragment>
                    ))}
                </List>
            );
        },
    };
}

const toRow = (serviceDefinition: ServiceDefinition, idx: number): TableRow => ({
    id: idx,
    name: serviceDefinition.name,
    system: serviceDefinition.system,
    serviceDefinition,
});

const columns: TableColumn<TableRow>[] = [
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
        cellStyle: { padding: '0px' },
        render: ({ serviceDefinition }) => (
            <List style={listStyle}>
                {serviceDefinition.versions?.map((version, idx) => (
                    <Fragment key={`${serviceDefinition.name}-${version.version}-${idx}`}>
                        <ListItem style={listItemStyle}>
                            <ServicePlatformChip
                                index={idx}
                                text={version.version}
                                link={`/api-platform/service/${serviceDefinition.system}/${serviceDefinition.serviceName}?version=${version.version}`}
                            />
                        </ListItem>
                        {idx < serviceDefinition.versions.length - 1 && <Divider />}
                    </Fragment>
                ))}
            </List>
        ),
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

const PAGE_SIZE = 20;

async function getData(apiPlatformApi: ApiPlatformBackendApi, query: Query<TableRow>, ownership: OwnershipType) {
    const page = query.page ?? 0;
    const pageSize = query.pageSize ?? PAGE_SIZE;

    const result = await apiPlatformApi.listServices({
        offset: page * pageSize,
        limit: pageSize,
        search: query.search,
        orderBy: query.orderBy ? {
            field: query.orderBy.field,
            direction: query.orderDirection,
        } as ServiceDefinitionsListRequest['orderBy'] : undefined,
        ownership: ownership,
    });
    if (result) {
        return {
            data: result.items.map(toRow),
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

interface ServicePlatformTableProps {
}

const STORAGE_OWNERSHIP_KEY = 'servicesTablePageOwner';
const STORAGE_SEARCH_KEY = 'servicesTablePageSearch';

export const ServicePlatformTable = ({ }: ServicePlatformTableProps) => {
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
        <Flex align="center">
            <Box mr='1' />
            {ownership === 'owned' ? 'Owned' : 'All'} Services ({countRows})
            <Box ml='2' />
            <ComponentOwnership storageKey={STORAGE_OWNERSHIP_KEY} handleOwnershipChange={setOwnership} />
        </Flex>
    ), [countRows, ownership]);

    useEffect(() => {
        const fetchCount = async () => {
            setLoadingCount(true);
            setError(null);
            try {
                const count = await apiPlatformApi.getServicesCount(ownership);
                setCountRows(count);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoadingCount(false);
            }
        };
        fetchCount();
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
            columns={columns}
            options={tableOptions}
            title={tableTitle}
            data={fetchData}
        />
    );
};