import { CodeSnippet } from '@backstage/core-components';
import { ApiEntity } from '@backstage/catalog-model';
import {
  EntityInfoCard,
  EntityRefLink,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { AboutField } from '@backstage/plugin-catalog';
import {
  ANNOTATION_API_NAME,
  ANNOTATION_API_PROJECT,
  ANNOTATION_API_VERSION,
} from '@internal/plugin-api-platform-common';
import { OpenApiDefinitionWidget } from '@internal/plugin-api-swagger-docs';
import {
  EntityApiDocsSpectralLinterCard,
  isApiDocsSpectralLinterAvailable,
} from '@internal/plugin-api-docs-spectral-linter';
import { ApiRelationCard } from './ApiRelationCard';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ApiAllRelationsCard } from './ApiAllRelationsCard';
import { ComponentAboutContent } from '../common/ComponentAboutContent';
import { Box, Tab, TabList, TabPanel, Tabs, Link, Flex } from '@backstage/ui';
import {
  ComponentDisplayName,
  LinkComponentDisplayName,
} from '@internal/plugin-components-react';

export const ApiDefinitionCard = () => {
  const { entity } = useEntity<ApiEntity>();
  const configApi = useApi(configApiRef);

  const organization = configApi.getString('apiPlatform.organization');
  const feedName = configApi.getString('apiPlatform.feedName');
  const apiDns = configApi.getString('apiPlatform.dns');
  const groupPrefix = configApi.getString('apiPlatform.groupPrefix');

  const project =
    entity.metadata.annotations?.[ANNOTATION_API_PROJECT]?.toString() ?? '';
  const apiName =
    entity.metadata.annotations?.[ANNOTATION_API_NAME]?.toString() ?? '';
  const apiVersion =
    entity.metadata.annotations?.[ANNOTATION_API_VERSION]?.toString();
  const groupId = `${groupPrefix}.${project}.apis`;
  const artifactId = `${apiName}-openapi`;

  const artifactUrl = `https://dev.azure.com/${organization}/${project}/_artifacts/feed/${feedName}/maven/${groupId}%2F${artifactId}/overview/${apiVersion?.toUpperCase()}`;
  const artifactText = `${groupId}:${artifactId}:${apiVersion}`;
  const platformUrl = `https://${apiDns}/api-resolved/${project}/${apiName}/${apiVersion}`;

  const mavenXml = `
<dependency>
    <groupId>${groupId}</groupId>
    <artifactId>${artifactId}</artifactId>
    <version>${apiVersion?.replace('-snapshot', '-SNAPSHOT')}</version>
    <type>yaml</type>
</dependency>
`;

  const definition = entity.spec.definition.toString();
  const isLinterAvailable = isApiDocsSpectralLinterAvailable(entity);
  const isMcaApi = entity.metadata.annotations?.['api.depo.be/type'] === 'mca';
  const isDeadCommonComponents =
    entity.metadata.annotations?.['api.depo.be/name'] === 'common-components' &&
    entity.metadata.annotations?.['api.depo.be/project'] === 'dead';

  return (
    <Tabs defaultSelectedKey="tab1">
      <TabList>
        <Tab id="tab1" href=".">
          OpenApi
        </Tab>
        <Tab id="tab2" href="raw">
          Raw
        </Tab>
        {isLinterAvailable && !isMcaApi && (
          <Tab id="tab3" href="linter">
            Linter
          </Tab>
        )}
        <Tab id="tab4" href="services">
          Services
        </Tab>
        <Tab id="tab5" href="info">
          Info
        </Tab>
      </TabList>
      <TabPanel id="tab1">
        <OpenApiDefinitionWidget definition={definition} />
      </TabPanel>
      <TabPanel id="tab2">
        <CodeSnippet text={definition} language="yaml" showCopyCodeButton />
      </TabPanel>
      {isLinterAvailable && !isMcaApi && (
        <TabPanel id="tab3">
          <EntityApiDocsSpectralLinterCard />
        </TabPanel>
      )}
      <TabPanel id="tab4">
        <Tabs key="tabs-services" defaultSelectedKey="tab4-1">
          <TabList>
            <Tab id="tab4-1">{apiVersion}</Tab>
            <Tab id="tab4-2">All versions</Tab>
          </TabList>
          <TabPanel id="tab4-1">
            <Flex direction="column" gap="4">
              <ApiRelationCard dependency="provider" />
              <ApiRelationCard dependency="consumer" />
            </Flex>
          </TabPanel>
          <TabPanel id="tab4-2">
            <Flex direction="column" gap="4">
              <ApiAllRelationsCard dependency="provider" />
              <ApiAllRelationsCard dependency="consumer" />
            </Flex>
          </TabPanel>
        </Tabs>
      </TabPanel>
      <TabPanel id="tab5">
        <EntityInfoCard title="About">
          <Box mb="4">
            <AboutField label="Catalog reference">
              <EntityRefLink entityRef={entity!} />
            </AboutField>
          </Box>
          <ComponentAboutContent entity={entity} />
          {!isMcaApi && !isDeadCommonComponents && (
            <>
              <Box mt="6">
                <AboutField label="Azure Artifact">
                  <LinkComponentDisplayName
                    href={artifactUrl}
                    text={artifactText}
                    type="azdo"
                    target="_blank"
                    rel="noopener noreferrer"
                    regular
                  />
                </AboutField>
              </Box>
              <Box mt="6">
                <AboutField label="Maven Snippet">
                  <CodeSnippet
                    text={mavenXml}
                    language="xmlDoc"
                    showCopyCodeButton
                  />
                </AboutField>
              </Box>
              <Box mt="6">
                <AboutField label="API Platform URL">
                  <LinkComponentDisplayName
                    href={platformUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    text={platformUrl}
                    type="url"
                    regular
                  />
                </AboutField>
              </Box>
            </>
          )}
          {isMcaApi && (
            <Box mt="6">
              <AboutField label="MCA Operation">
                <LinkComponentDisplayName
                  href={`/mca/components/${entity.metadata.annotations?.['api.depo.be/name']}`}
                  text={`${entity.metadata.annotations?.['api.depo.be/name']}`}
                  type="api"
                />
              </AboutField>
            </Box>
          )}
          {isDeadCommonComponents && (
            <Box mt="6">
              <AboutField label="API Platform URL">
                <Link
                  href={`https://${apiDns}/api-domains/common/${apiName}/${apiVersion}`}
                  weight="bold"
                  color="info"
                  target="_blank"
                  rel="noopener noreferrer"
                  standalone
                >
                  <ComponentDisplayName
                    text={`https://${apiDns}/api-domains/common/${apiName}/${apiVersion}`}
                    type="url"
                  />
                </Link>
              </AboutField>
            </Box>
          )}
        </EntityInfoCard>
      </TabPanel>
    </Tabs>
  );
};
