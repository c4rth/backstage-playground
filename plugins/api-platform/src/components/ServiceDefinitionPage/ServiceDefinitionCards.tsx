import {
  ComponentEntity,
  getCompoundEntityRef,
} from '@backstage/catalog-model';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
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
import { ServiceApiRelationCard } from './ServiceApiRelationCard';
import { ServiceLibraryRelationCard } from './ServiceLibraryRelationCard';
import { LinkComponentDisplayName } from '@internal/plugin-components-react';
import { ComponentAboutContent } from '../common/ComponentAboutContent';
import { getAnnotationValuesFromEntity } from '@backstage-community/plugin-azure-devops-common';
import { useEntity } from '@backstage/plugin-catalog-react';
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
import { isAzureDevOpsAvailable } from '@internal/plugin-azure-devops';

export const ServiceDefinitionOverviewCard = () => {
  const { entity } = useEntity<ComponentEntity>();

  const configApi = useApi(configApiRef);
  const platform = (
    entity.metadata.annotations?.[ANNOTATION_SERVICE_PLATFORM] || 'cloud'
  ).toString();
  const imageVersion =
    entity.metadata.annotations?.[ANNOTATION_IMAGE_VERSION]?.toString();
  const entityRef = getCompoundEntityRef(entity);
  const hasDocs = Boolean(
    entity.metadata.annotations?.['backstage.io/techdocs-ref'],
  );
  const azureDevOps = isAzureDevOpsAvailable(entity);
  let repositoryUrl: string | undefined;
  let repository: string | undefined;

  if (azureDevOps) {
    const lifecycle = entity.spec.lifecycle;
    const { project, repo } = getAnnotationValuesFromEntity(entity);
    repositoryUrl = `https://${configApi.getString('azureDevOps.host')}/${configApi.getString('azureDevOps.organization')}/${project}/_git/${repo}?version=GT${lifecycle}`;
    repository = `${project}/${repo}`;
  }

  return (
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
                      regular
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
  );
};

export const ServiceDefinitionDependenciesCard = () => {
  return (
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
  );
};
