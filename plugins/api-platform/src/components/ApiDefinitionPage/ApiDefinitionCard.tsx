import {
  CodeSnippet,
  InfoCard,
  TabbedLayout,
  Link,
} from '@backstage/core-components';
import { ApiEntity } from "@backstage/catalog-model";
import { PlainApiDefinitionWidget } from '@backstage/plugin-api-docs';
import { EntityRefLink, useEntity } from '@backstage/plugin-catalog-react';
import { AboutField } from '@backstage/plugin-catalog';
import { ANNOTATION_API_NAME, ANNOTATION_API_PROJECT, ANNOTATION_API_VERSION } from '@internal/plugin-api-platform-common';
import { OpenApiDefinitionWidget } from '@internal/plugin-api-swagger-docs';
import { EntityApiDocsSpectralLinterCard, isApiDocsSpectralLinterAvailable } from '@internal/plugin-api-docs-spectral-linter';
import { ApiRelationCard } from './ApiRelationCard';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ApiAllRelationsCard } from './ApiAllRelationsCard';
import { ComponentAboutContent } from '../common/ComponentAboutContent';
import { Box, Grid } from '@backstage/ui';
import { ComponentDisplayName } from '../common';

export const ApiDefinitionCard = () => {
  const { entity } = useEntity<ApiEntity>();
  const configApi = useApi(configApiRef);

  const organization = configApi.getString('apiPlatform.organization');
  const feedName = configApi.getString('apiPlatform.feedName');
  const apiDns = configApi.getString('apiPlatform.dns');
  const groupPrefix = configApi.getString('apiPlatform.groupPrefix');

  const project = entity.metadata[ANNOTATION_API_PROJECT];
  const apiName = entity.metadata[ANNOTATION_API_NAME];
  const apiVersion = entity.metadata[ANNOTATION_API_VERSION]?.toString().toUpperCase();
  const groupId = `${groupPrefix}.${project}.apis`;
  const artifactId = `${apiName}-openapi`;

  const artifactUrl = `https://dev.azure.com/${organization}/${project}/_artifacts/feed/${feedName}/maven/${groupId}%2F${artifactId}/overview/${apiVersion}`;
  const artifactText = `${groupId}:${artifactId}:${apiVersion}`;
  const platformUrl = `https://${apiDns}/api-resolved/${project}/${apiName}/${entity.metadata[ANNOTATION_API_VERSION]}`;

  const mavenXml = `
<dependency>
    <groupId>${groupId}</groupId>
    <artifactId>${artifactId}</artifactId>
    <version>${apiVersion}</version>
    <type>yaml</type>
</dependency>
`;

  const definition = entity.spec.definition.toString();
  const isLinterAvailable = isApiDocsSpectralLinterAvailable(entity);

  return (
    <TabbedLayout>
      <TabbedLayout.Route path="/" title="OpenApi">
        <OpenApiDefinitionWidget definition={definition} />
      </TabbedLayout.Route>
      <TabbedLayout.Route path="/raw" title="Raw">
        <PlainApiDefinitionWidget definition={definition} language="yaml" />
      </TabbedLayout.Route>
      {isLinterAvailable && (
        <TabbedLayout.Route path="/linter" title="Linter">
          <EntityApiDocsSpectralLinterCard />
        </TabbedLayout.Route>
      )}
      <TabbedLayout.Route path="/services" title="Services">
        <TabbedLayout>
          <TabbedLayout.Route path="/services/this" title={`${apiVersion}`}>
            <Grid.Root style={{ alignItems: 'stretch' }}>
              <Grid.Item colSpan='6'>
                <ApiRelationCard dependency='provider' />
              </Grid.Item>
              <Grid.Item colSpan='6'>
                <ApiRelationCard dependency='consumer' />
              </Grid.Item>
            </Grid.Root>
          </TabbedLayout.Route>
          <TabbedLayout.Route path="/services/all" title="All versions">
            <Grid.Root style={{ alignItems: 'stretch' }}>
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
            <AboutField label="Catalog reference" gridSizes={{ xs: 12 }}>
              <EntityRefLink entityRef={entity!} />
            </AboutField>
          </Box>
          <ComponentAboutContent entity={entity} />
          <Box mt='5'>
            <AboutField label="Azure Artifact" gridSizes={{ xs: 12 }}>
              <Link to={artifactUrl} target="_blank" rel="noopener noreferrer">
                <ComponentDisplayName text={artifactText} type='azdo' />
              </Link>
            </AboutField>
          </Box>
          <Box mt='5'>
            <AboutField label="Maven Snippet" gridSizes={{ xs: 4 }}>
              <CodeSnippet text={mavenXml} language="xmlDoc" showCopyCodeButton />
            </AboutField>
          </Box>
          <Box mt='5'>
            <AboutField label="API Platform URL" gridSizes={{ xs: 12 }}>
              <Link to={platformUrl} target="_blank" rel="noopener noreferrer">
                <ComponentDisplayName text={platformUrl} type='url' />
              </Link>
            </AboutField>
          </Box>
        </InfoCard>
      </TabbedLayout.Route>
    </TabbedLayout>
  );
};
