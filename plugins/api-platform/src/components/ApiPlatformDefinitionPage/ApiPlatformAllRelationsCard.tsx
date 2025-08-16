import { Link, ResponseErrorPanel, Table, TableColumn } from "@backstage/core-components";
import { memo, useMemo } from 'react';
import { Box } from "@material-ui/core";
import { Entity, parseEntityRef, RELATION_API_CONSUMED_BY, RELATION_API_PROVIDED_BY } from "@backstage/catalog-model";
import { CatalogApi, catalogApiRef, useEntity } from '@backstage/plugin-catalog-react';
import { useApi } from "@backstage/core-plugin-api";
import useAsync from 'react-use/esm/useAsync';
import {
    ANNOTATION_API_NAME,
    ANNOTATION_API_VERSION,
    ANNOTATION_SERVICE_NAME,
    ANNOTATION_SERVICE_VERSION,
    CATALOG_METADATA_SERVICE_NAME,
    CATALOG_METADATA_SERVICE_VERSION,
    CATALOG_SPEC_LIFECYCLE
} from "@internal/plugin-api-platform-common";
import { useGetApiVersions } from "../../hooks";
import semver from 'semver';
import { ComponentDisplayName } from "../common";

type TableRow = {
    readonly id: number;
    readonly apiVersion: string;
    readonly svcName: string;
    readonly svcVersion: string;
    readonly svcEnvironment: string;
};

const serviceColumns: TableColumn<TableRow>[] = [
    {
        title: 'Name',
        width: '50%',
        field: 'svcName',
        highlight: true,
        render: ({ svcName, svcVersion, svcEnvironment }: TableRow) => (
            <Link to={`/api-platform/service/${svcName}?version=${svcVersion}&env=${svcEnvironment}`}>
                <ComponentDisplayName text={svcName} type='service' />
            </Link>
        ),
    },
    {
        title: 'API Version',
        width: '20%',
        field: 'apiVersion',
        defaultSort: 'asc',
        customSort: (a, b) => {
            const aValid = semver.valid(a.apiVersion);
            const bValid = semver.valid(b.apiVersion);
            if (aValid && bValid) {
                return semver.compare(a.apiVersion, b.apiVersion);
            }
            return a.apiVersion.localeCompare(b.apiVersion);
        },
    },
    {
        title: 'Version',
        width: '10%',
        field: 'svcVersion',
        customSort: (a, b) => {
            const aValid = semver.valid(a.svcVersion);
            const bValid = semver.valid(b.svcVersion);
            if (aValid && bValid) {
                return semver.compare(a.svcVersion, b.svcVersion);
            }
            return a.svcVersion.localeCompare(b.svcVersion);
        },
    },
    {
        title: 'Environment',
        width: '20%',
        field: 'svcEnvironment',
    },
];

const toRow = (service: Entity & { apiVersion: string }, idx: number): TableRow => ({
    id: idx,
    apiVersion: service.apiVersion || '?',
    svcName: service.metadata[ANNOTATION_SERVICE_NAME]?.toString() ?? '?',
    svcVersion: service.metadata[ANNOTATION_SERVICE_VERSION]?.toString() ?? '?',
    svcEnvironment: service.spec?.lifecycle?.toString().toUpperCase() ?? '?',
});

const fetchEntities = async (
    catalogApi: CatalogApi,
    entity: Entity,
    dependency: 'provider' | 'consumer'
): Promise<Entity[]> => {
    const relationType = dependency === 'consumer' ? RELATION_API_CONSUMED_BY : RELATION_API_PROVIDED_BY;
    const relations = entity.relations?.filter(relation => relation.type === relationType) ?? [];

    if (relations.length === 0) {
        return [];
    }

    const targetNames = relations.map(relation => parseEntityRef(relation.targetRef).name);

    const response = await catalogApi.getEntities({
        fields: [
            CATALOG_METADATA_SERVICE_NAME,
            CATALOG_METADATA_SERVICE_VERSION,
            CATALOG_SPEC_LIFECYCLE,
        ],
        filter: {
            kind: ['Component'],
            'spec.type': ['service'],
            'metadata.name': targetNames,
        },
    });

    return response.items;
};

const tableOptions = {
    search: true,
    padding: 'dense' as const,
    paging: false,
    draggable: false,
    thirdSortClick: false,
} as const;

interface ApiPlatformAllRelationsCardProps {
    readonly dependency: 'provider' | 'consumer';
}

export const ApiPlatformAllRelationsCard = memo<ApiPlatformAllRelationsCardProps>(({ dependency }) => {
    const { entity } = useEntity();
    const catalogApi = useApi(catalogApiRef);

    const system = useMemo(() =>
        entity.spec?.system?.toString() ?? '',
        [entity.spec]
    );

    const apiName = useMemo(() =>
        entity.metadata[ANNOTATION_API_NAME]?.toString() ?? '',
        [entity.metadata]
    );

    const title = useMemo(() =>
        dependency === 'consumer' ? 'Consumers' : 'Providers',
        [dependency]
    );

    const { apiVersions, loading: versionsLoading, error: versionsError } = useGetApiVersions(system, apiName);

    const { value: allServices = [], loading: servicesLoading, error: servicesError } = useAsync(async () => {
        if (!apiVersions?.length || !apiName) return [];

        const apiEntities = await catalogApi.getEntities({
            filter: {
                kind: ['API'],
                [`metadata.${ANNOTATION_API_NAME}`]: [apiName],
            },
        });

        const servicePromises = apiEntities.items
            .filter(apiEntity => apiEntity.metadata[ANNOTATION_API_VERSION])
            .map(async apiEntity => {
                const apiVersion = apiEntity.metadata[ANNOTATION_API_VERSION]!.toString();
                try {
                    const services = await fetchEntities(catalogApi, apiEntity, dependency);
                    return services.map(service => ({ ...service, apiVersion }));
                } catch {
                    // Continue with other versions even if one fails
                    return [];
                }
            });

        const serviceArrays = await Promise.all(servicePromises);
        return serviceArrays.flat();
    }, [apiVersions, catalogApi, dependency, apiName]);

    const rows = useMemo(() => allServices.map(toRow), [allServices]);

    const tableTitle = useMemo(() => (
        <Box display="flex" alignItems="center">
            <Box mr={1} />
            {title} ({rows.length})
        </Box>
    ), [title, rows.length]);

    const loading = versionsLoading || servicesLoading;
    const error = versionsError || servicesError;

    if (error) {
        return <ResponseErrorPanel title={`Error loading ${title.toLowerCase()}`} error={error} />;
    }

    return (
        <Table<TableRow>
            isLoading={loading}
            columns={serviceColumns}
            options={tableOptions}
            title={tableTitle}
            data={rows}
        />
    );
});