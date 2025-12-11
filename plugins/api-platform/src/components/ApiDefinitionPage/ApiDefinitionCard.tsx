import {
    CodeSnippet,
    InfoCard,
    TabbedLayout,
    Link,
} from '@backstage/core-components';
import { ApiEntity } from "@backstage/catalog-model"
import { PlainApiDefinitionWidget } from '@backstage/plugin-api-docs';
import { EntityRefLink, useEntity } from '@backstage/plugin-catalog-react';
import { AboutField } from '@backstage/plugin-catalog';
import { ANNOTATION_API_NAME, ANNOTATION_API_PROJECT, ANNOTATION_API_VERSION } from '@internal/plugin-api-platform-common';
import { OpenApiDefinitionWidget } from '@internal/plugin-api-swagger-docs';
// Spectral 
import { EntityApiDocsSpectralLinterCard, isApiDocsSpectralLinterAvailable } from '@internal/plugin-api-docs-spectral-linter';
import { ApiRelationCard } from './ApiRelationCard';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { useMemo } from 'react';
import { ApiAllRelationsCard } from './ApiAllRelationsCard';
import { ComponentAboutContent } from '../common/ComponentAboutContent';
import { Box, Grid } from '@backstage/ui';
import { ComponentDisplayName } from '../common';


export const ApiDefinitionCard = () => {
    const { entity } = useEntity<ApiEntity>();
    const configApi = useApi(configApiRef);

    const config = useMemo(() => ({
        organization: configApi.getString('apiPlatform.organization'),
        feedName: configApi.getString('apiPlatform.feedName'),
        apiDns: configApi.getString('apiPlatform.dns'),
        groupPrefix: configApi.getString('apiPlatform.groupPrefix'),
    }), [configApi]);

    const apiData = useMemo(() => {
        const project = entity.metadata[ANNOTATION_API_PROJECT];
        const apiName = entity.metadata[ANNOTATION_API_NAME];
        const apiVersion = entity.metadata[ANNOTATION_API_VERSION]?.toString().toUpperCase();
        const groupId = `${config.groupPrefix}.${project}.apis`;
        const artifactId = `${apiName}-openapi`;

        return {
            project,
            apiName,
            apiVersion,
            groupId,
            artifactId,
            artifactUrl: `https://dev.azure.com/${config.organization}/${project}/_artifacts/feed/${config.feedName}/maven/${groupId}%2F${artifactId}/overview/${apiVersion}`,
            artifactText: `${groupId}:${artifactId}:${apiVersion}`,
            platformUrl: `https://${config.apiDns}/api-resolved/${project}/${apiName}/${entity.metadata[ANNOTATION_API_VERSION]}`,
        };
    }, [entity.metadata, config]);

    const mavenXml = useMemo(() => `
<dependency>
    <groupId>${apiData.groupId}</groupId>
    <artifactId>${apiData.artifactId}</artifactId>
    <version>${apiData.apiVersion}</version>
    <type>yaml</type>
</dependency>
`, [apiData.groupId, apiData.artifactId, apiData.apiVersion]);

    const apiSpec = useMemo(() => ({
        definition: entity.spec.definition.toString(),
        language: 'yaml',
    }), [entity.spec.definition]);

    const isLinterAvailable = useMemo(() =>
        isApiDocsSpectralLinterAvailable(entity),
        [entity]
    );

    return (
        <TabbedLayout>
            <TabbedLayout.Route path="/" title="OpenApi">
                <OpenApiDefinitionWidget definition={apiSpec.definition} />
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/raw" title="Raw">
                <PlainApiDefinitionWidget
                    definition={apiSpec.definition}
                    language={apiSpec.language}
                />
            </TabbedLayout.Route>
            {isLinterAvailable && (
                <TabbedLayout.Route path="/linter" title="Linter">
                    <EntityApiDocsSpectralLinterCard />
                </TabbedLayout.Route>
            )}
            <TabbedLayout.Route path="/services" title="Services">
                <TabbedLayout>
                    <TabbedLayout.Route path="/services/this" title={`${apiData.apiVersion}`}>
                        <Grid.Root style={{
                            alignItems: 'stretch',
                        }}>
                            <Grid.Item colSpan='6'>
                                <ApiRelationCard dependency='provider' />
                            </Grid.Item>
                            <Grid.Item colSpan='6'>
                                <ApiRelationCard dependency='consumer' />
                            </Grid.Item>
                        </Grid.Root>
                    </TabbedLayout.Route>
                    <TabbedLayout.Route path="/services/all" title="All versions">
                        <Grid.Root style={{
                            alignItems: 'stretch',
                        }}>
                            <Grid.Item colSpan='6'>
                                <ApiAllRelationsCard dependency='provider' />
                            </Grid.Item>
                            <Grid.Item colSpan='6'>
                                <ApiAllRelationsCard dependency='consumer' />
                            </Grid.Item>
                        </Grid.Root>
                    </TabbedLayout.Route>
                </TabbedLayout>
            </TabbedLayout.Route>
            <TabbedLayout.Route path="/info" title="Info">
                <InfoCard title='About' divider>
                    <Box mb='4'>
                        <AboutField
                            label="Catalog reference"
                            gridSizes={{ xs: 12 }} >
                            <EntityRefLink entityRef={entity!} />
                        </AboutField>
                    </Box>
                    <ComponentAboutContent entity={entity} />
                    <Box mt='5'>
                        <AboutField
                            label="Azure Artifact"
                            gridSizes={{ xs: 12 }} >
                            <Link to={apiData.artifactUrl} target="_blank" rel="noopener noreferrer">
                                <ComponentDisplayName text={apiData.artifactText} type='azdo' />
                            </Link>
                        </AboutField>
                    </Box>
                    <Box mt='5'>
                        <AboutField
                            label="Maven Snippet"
                            gridSizes={{ xs: 4 }}>
                            <CodeSnippet text={mavenXml} language="xmlDoc" showCopyCodeButton />
                        </AboutField>
                    </Box>
                    <Box mt='5'>
                        <AboutField label="API Platform URL" gridSizes={{ xs: 12 }}>
                            <Link to={apiData.platformUrl} target="_blank" rel="noopener noreferrer">
                                <ComponentDisplayName text={apiData.platformUrl} type='url' />
                            </Link>
                        </AboutField>
                    </Box>
                </InfoCard>
            </TabbedLayout.Route>
        </TabbedLayout>
    );
}
