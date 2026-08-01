import {
  ComponentEntity,
  getCompoundEntityRef,
} from '@backstage/catalog-model';
import { EntityInfoCard, EntityRefLink } from '@backstage/plugin-catalog-react';
import { AboutField } from '@backstage/plugin-catalog';
import {
  Direction,
  EntityCatalogGraphCard,
} from '@backstage/plugin-catalog-graph';
import {
  ANNOTATION_IMAGE_VERSION,
  ANNOTATION_SERVICE_PLATFORM,
} from '@internal/plugin-api-platform-common';
// SonarQube
import { EntitySonarQubeContentPage } from '@backstage-community/plugin-sonarqube';
import { isSonarQubeAvailable } from '@backstage-community/plugin-sonarqube-react';
// Api Platform
import { ServiceApiRelationCard } from './ServiceApiRelationCard';
import { ServiceLibraryRelationCard } from './ServiceLibraryRelationCard';
import { LinkComponentDisplayName } from '@internal/plugin-components-react';
// App Registry
import { AppRegistryPage } from '@internal/plugin-app-registry';
import { ComponentAboutContent } from '../common/ComponentAboutContent';
// Azure DevOps
import {
  AzureDevOpsPipelinePage,
  AzureDevOpsGitTagsPage,
  AzureReadmeCard,
} from '@internal/plugin-azure-devops';
//
import { getAnnotationValuesFromEntity } from '@backstage-community/plugin-azure-devops-common';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import {
  Grid,
  Box,
  Text,
  ButtonIcon,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Link,
  Flex,
} from '@backstage/ui';
import { RiFileFill } from '@remixicon/react';
import {
  isAzureDevOpsAvailable,
  isAzurePipelinesAvailable,
} from '@internal/plugin-azure-devops';

export const ServiceDefinitionCard = ({
  entity,
}: {
  entity: ComponentEntity;
}) => {
  const configApi = useApi(configApiRef);

  const sonarQube = isSonarQubeAvailable(entity);
  const azureDevOps = isAzureDevOpsAvailable(entity);
  const azurePipelines = isAzurePipelinesAvailable(entity);

  const platform = (
    entity.metadata.annotations?.[ANNOTATION_SERVICE_PLATFORM] || 'cloud'
  ).toString();
  const imageVersion =
    entity.metadata.annotations?.[ANNOTATION_IMAGE_VERSION]?.toString();
  const entityRef = getCompoundEntityRef(entity);
  const hasDocs = Boolean(
    entity.metadata.annotations?.['backstage.io/techdocs-ref'],
  );

  let repositoryUrl: string | undefined;
  let repository: string | undefined;

  if (azureDevOps) {
    const lifecycle = entity.spec.lifecycle;
    const { project, repo } = getAnnotationValuesFromEntity(entity);
    repositoryUrl = `https://${configApi.getString('azureDevOps.host')}/${configApi.getString('azureDevOps.organization')}/${project}/_git/${repo}?version=GT${lifecycle}`;
    repository = `${project}/${repo}`;
  }

  return (
    <Tabs defaultSelectedKey="tab1">
      <TabList>
        <Tab id="tab1" href=".">
          Overview
        </Tab>
        <Tab id="tab2" href="dependencies">
          Dependencies
        </Tab>
        <Tab id="tab3" href="app-registry">
          App Registry
        </Tab>
        {azurePipelines && (
          <Tab id="tab4" href="ci-cd">
            CI/CD
          </Tab>
        )}
        {azureDevOps && (
          <Tab id="tab5" href="git-tags">
            Git Tags
          </Tab>
        )}
        {azureDevOps && (
          <Tab id="tab6" href="readme">
            Readme
          </Tab>
        )}
        {sonarQube && (
          <Tab id="tab7" href="sonarqube">
            SonarQube
          </Tab>
        )}
      </TabList>
      <TabPanel id="tab1">
        <Grid.Root columns="12">
          <Grid.Item colSpan="6">
            <EntityInfoCard
              title="About"
              headerActions={
                <Link
                  href={`/docs/${entityRef.namespace}/${entityRef.kind}/${entityRef.name}`}
                  standalone
                >
                  <ButtonIcon
                    icon={<RiFileFill />}
                    isDisabled={!hasDocs}
                    size="medium"
                    variant="tertiary"
                  />
                </Link>
              }
            >
              <Box>
                <Grid.Root columns="12">
                  <Grid.Item colSpan="4">
                    <AboutField label="Service reference">
                      <EntityRefLink entityRef={entity} />
                    </AboutField>
                  </Grid.Item>

                  <Grid.Item colSpan="4">
                    <AboutField label="Platform">
                      <Text variant="body-medium">{platform}</Text>
                    </AboutField>
                  </Grid.Item>

                  <Grid.Item colSpan="4">
                    <AboutField label="Image version">
                      <Text variant="body-medium">{imageVersion || 'N/A'}</Text>
                    </AboutField>
                  </Grid.Item>

                  <Grid.Item colSpan="12">
                    <AboutField label="Repository">
                      {repository && repositoryUrl ? (
                        <LinkComponentDisplayName
                          href={repositoryUrl}
                          text={repository}
                          type="azdo"
                        />
                      ) : (
                        <Text variant="body-medium">-</Text>
                      )}
                    </AboutField>
                  </Grid.Item>
                </Grid.Root>
              </Box>
              <Box mt="6">
                <ComponentAboutContent entity={entity} />
              </Box>
            </EntityInfoCard>
          </Grid.Item>
          <Grid.Item colSpan="6">
            <EntityCatalogGraphCard
              height={400}
              kinds={['API', 'Component']}
              direction={Direction.TOP_BOTTOM}
              unidirectional
            />
          </Grid.Item>
        </Grid.Root>
      </TabPanel>

      <TabPanel id="tab2">
        <Tabs key="tabs-dependencies" defaultSelectedKey="tab2-1">
          <TabList>
            <Tab id="tab2-1">APIs</Tab>
            <Tab id="tab2-2">Libraries</Tab>
          </TabList>
          <TabPanel id="tab2-1">
            <Flex direction="column" gap="4">
              <ServiceApiRelationCard dependency="provided" />
              <ServiceApiRelationCard dependency="consumed" />
            </Flex>
          </TabPanel>
          <TabPanel id="tab2-2">
            <ServiceLibraryRelationCard />
          </TabPanel>
        </Tabs>
      </TabPanel>

      <TabPanel id="tab3">
        <AppRegistryPage />
      </TabPanel>

      {azurePipelines && (
        <TabPanel id="tab4">
          <AzureDevOpsPipelinePage />
        </TabPanel>
      )}

      {azureDevOps && (
        <TabPanel id="tab5">
          <AzureDevOpsGitTagsPage />
        </TabPanel>
      )}

      {azureDevOps && (
        <TabPanel id="tab6">
          <AzureReadmeCard />
        </TabPanel>
      )}

      {sonarQube && (
        <TabPanel id="tab7">
          <EntitySonarQubeContentPage />
        </TabPanel>
      )}
    </Tabs>
  );
};
