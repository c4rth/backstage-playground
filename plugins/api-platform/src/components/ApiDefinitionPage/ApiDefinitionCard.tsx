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

  const project = entity.metadata.annotations?.[ANNOTATION_API_PROJECT]?.toString() ?? '';
  const apiName = entity.metadata.annotations?.[ANNOTATION_API_NAME]?.toString() ?? '';
  const apiVersion = entity.metadata.annotations?.[ANNOTATION_API_VERSION]?.toString();
  const groupId = `${groupPrefix}.${project}.apis`;
  const artifactId = `${apiName}-openapi`;

  const artifactUrl = `https://dev.azure.com/${organization}/${project}/_artifacts/feed/${feedName}/maven/${groupId}%2F${artifactId}/overview/${apiVersion?.toUpperCase()}`;
  const artifactText = `${groupId}:${artifactId}:${apiVersion}`;
  const platformUrl = `https://${apiDns}/api-resolved/${project}/${apiName}/${apiVersion}`;

  const mavenXml = `
<dependency>
    <groupId>${groupId}</groupId>
    <artifactId>${artifactId}</artifactId>
    <version>${apiVersion?.replace("-snapshot","-SNAPSHOT")}</version>
    <type>yaml</type>
</dependency>
`;

  const definition = entity.spec.definition.toString();
  const isLinterAvailable = isApiDocsSpectralLinterAvailable(entity);
  const isMcaApi = entity.metadata.annotations?.['api.depo.be/type'] === 'mca';
  const isDeadCommonComponents = entity.metadata.annotations?.['api.depo.be/name'] === 'common-components' && entity.metadata.annotations?.['api.depo.be/project'] === 'dead';

  return (
    <TabbedLayout>
      <TabbedLayout.Route path="/" title="OpenApi">
        <OpenApiDefinitionWidget definition={definition} />
      </TabbedLayout.Route>
      <TabbedLayout.Route path="/raw" title="Raw">
        <PlainApiDefinitionWidget definition={definition} language="yaml" />
      </TabbedLayout.Route>
      {isLinterAvailable && !isMcaApi && (
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
            <AboutField label="Catalog reference" >
              <EntityRefLink entityRef={entity!} />
            </AboutField>
          </Box>
          <ComponentAboutContent entity={entity} />
          {!isMcaApi && !isDeadCommonComponents && (
            <>
              <Box mt='5'>
                <AboutField label="Azure Artifact">
                  <Link to={artifactUrl} target="_blank" rel="noopener noreferrer">
                    <ComponentDisplayName text={artifactText} type='azdo' />
                  </Link>
                </AboutField>
              </Box>
              <Box mt='5'>
                <AboutField label="Maven Snippet" >
                  <CodeSnippet text={mavenXml} language="xmlDoc" showCopyCodeButton />
                </AboutField>
              </Box>
              <Box mt='5'>
                <AboutField label="API Platform URL">
                  <Link to={platformUrl} target="_blank" rel="noopener noreferrer">
                    <ComponentDisplayName text={platformUrl} type='url' />
                  </Link>
                </AboutField>
              </Box>
            </>
          )}
          {isMcaApi && (
            <Box mt='5'>
              <AboutField label="MCA Operation">
                <Link to={`/mca/components/${entity.metadata.annotations?.['api.depo.be/name']}`} >
                  <ComponentDisplayName text={`${entity.metadata.annotations?.['api.depo.be/name']}`} type='api' />
                </Link>
              </AboutField>
            </Box>
          )}
          {isDeadCommonComponents && (
            <Box mt='5'>
              <AboutField label="API Platform URL">
                <Link to={`https://${apiDns}/api-domains/common/${apiName}/${apiVersion}`} target="_blank" rel="noopener noreferrer">
                  <ComponentDisplayName text={`https://${apiDns}/api-domains/common/${apiName}/${apiVersion}`} type='url' />
                </Link>
              </AboutField>
            </Box>
          )}
        </InfoCard>
      </TabbedLayout.Route>
    </TabbedLayout>
  );
};
