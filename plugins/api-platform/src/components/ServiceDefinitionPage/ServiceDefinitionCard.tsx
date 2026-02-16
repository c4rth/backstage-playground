import {
  InfoCard,
  TabbedLayout,
  Link,
} from '@backstage/core-components';
import { ComponentEntity, getCompoundEntityRef } from "@backstage/catalog-model";
import { EntityRefLink, useEntity } from '@backstage/plugin-catalog-react';
import {
  AboutField,
} from '@backstage/plugin-catalog';
import {
  Direction,
  EntityCatalogGraphCard,
} from '@backstage/plugin-catalog-graph';
import { ANNOTATION_IMAGE_VERSION, ANNOTATION_SERVICE_PLATFORM } from '@internal/plugin-api-platform-common';
// SonarQube
import { EntitySonarQubeContentPage } from '@backstage-community/plugin-sonarqube';
import { isSonarQubeAvailable } from '@backstage-community/plugin-sonarqube-react';
// Api Platform
import { ServiceApiRelationCard } from './ServiceApiRelationCard';
import { ServiceLibraryRelationCard } from './ServiceLibraryRelationCard';
import { ComponentDisplayName } from '../common';
// App Registry
import { AppRegistryPage } from '@internal/plugin-app-registry';
import { ComponentAboutContent } from '../common/ComponentAboutContent';
// Azure DevOps
import { AzureDevOpsPipelinePage, AzureDevOpsGitTagsPage, AzureReadmeCard } from '@internal/plugin-azure-devops';
//
import { getAnnotationValuesFromEntity } from '@backstage-community/plugin-azure-devops-common';
import { configApiRef, featureFlagsApiRef, useApi } from '@backstage/core-plugin-api';
import { Grid, Box, Text, ButtonIcon } from '@backstage/ui';
import { RiFileFill } from '@remixicon/react';
import styles from './ServiceDefinitionCard.module.css';
import { isAzureDevOpsAvailable, isAzurePipelinesAvailable } from '@internal/plugin-azure-devops';

export const ServiceDefinitionCard = ({ entity }: { entity: ComponentEntity }) => {
  const configApi = useApi(configApiRef);
  const featureFlagsApi = useApi(featureFlagsApiRef);

  const sonarQube = isSonarQubeAvailable(entity);
  const azureDevOps = isAzureDevOpsAvailable(entity);
  const azurePipelines = isAzurePipelinesAvailable(entity);
  const showLibraries = featureFlagsApi.isActive('enable-api-platform-libraries');

  const platform = (entity.metadata[ANNOTATION_SERVICE_PLATFORM] || 'cloud').toString();
  const imageVersion = entity.metadata[ANNOTATION_IMAGE_VERSION]?.toString();
  const entityRef = getCompoundEntityRef(entity);
  const hasDocs = Boolean(entity.metadata.annotations?.['backstage.io/techdocs-ref']);

  let repositoryUrl: string | undefined;
  let repository: string | undefined;

  if (azureDevOps) {
    const lifecycle = entity.spec.lifecycle;
    const { project, repo } = getAnnotationValuesFromEntity(entity);
    repositoryUrl = `https://${configApi.getString('azureDevOps.host')}/${configApi.getString('azureDevOps.organization')}/${project}/_git/${repo}?version=GT${lifecycle}`;
    repository = `${project}/${repo}`;
  }

  return (
    <TabbedLayout>
      <TabbedLayout.Route path="/" title="Overview">
        <Grid.Root columns='12'>
          <Grid.Item colSpan='6'>
            <InfoCard
              title="About"
              divider
              className={styles.gridItemCard}
              action={
                <Link to={`/docs/${entityRef.namespace}/${entityRef.kind}/${entityRef.name}`}>
                  <ButtonIcon
                    icon={<RiFileFill />}
                    isDisabled={!hasDocs}
                    size='medium'
                    variant='tertiary'
                  />
                </Link>
              }
            >
              <Box>
                <Grid.Root columns='12'>
                  <Grid.Item colSpan='4'>
                    <AboutField label="Service reference">
                      <EntityRefLink entityRef={entity} />
                    </AboutField>
                  </Grid.Item>

                  <Grid.Item colSpan='4'>
                    <AboutField label="Platform">
                      <Text variant='body-medium'>
                        {platform}
                      </Text>
                    </AboutField>
                  </Grid.Item>

                  <Grid.Item colSpan='4'>
                    <AboutField label="Image version">
                      <Text variant='body-medium'>
                        {imageVersion || 'N/A'}
                      </Text>
                    </AboutField>
                  </Grid.Item>

                  <Grid.Item colSpan='12'>
                    <AboutField label="Repository">
                      {repository && repositoryUrl ? (
                        <Link to={repositoryUrl}>
                          <ComponentDisplayName text={repository} type='azdo' />
                        </Link>
                      ) : (
                        <Text variant='body-medium'>
                          -
                        </Text>
                      )}
                    </AboutField>
                  </Grid.Item>
                </Grid.Root>
              </Box>
              <Box mt='6' />
              <ComponentAboutContent entity={entity} />
            </InfoCard>
          </Grid.Item>
          <Grid.Item colSpan='6'>
            <EntityCatalogGraphCard
              variant="gridItem"
              height={400}
              kinds={['API', 'Component']}
              direction={Direction.TOP_BOTTOM}
              unidirectional
            />
          </Grid.Item>
        </Grid.Root>
      </TabbedLayout.Route>

      <TabbedLayout.Route path="/dependencies" title="Dependencies">
        <TabbedLayout>
          <TabbedLayout.Route path="/apis" title="APIs">
            <Grid.Root columns='12'>
              <Grid.Item colSpan='6'>
                <ServiceApiRelationCard dependency="provided" />
              </Grid.Item>
              <Grid.Item colSpan='6'>
                <ServiceApiRelationCard dependency="consumed" />
              </Grid.Item>
            </Grid.Root>
          </TabbedLayout.Route>
          {showLibraries && (
            <TabbedLayout.Route path="/libraries" title="Libraries">
              <ServiceLibraryRelationCard />
            </TabbedLayout.Route>
          )}
        </TabbedLayout>
      </TabbedLayout.Route>

      <TabbedLayout.Route path="/appreg" title="App Registry">
        <AppRegistryPage />
      </TabbedLayout.Route>

      {azurePipelines && (
        <TabbedLayout.Route path="/ci-cd" title="CI/CD">
          <AzureDevOpsPipelinePage />
        </TabbedLayout.Route>
      )}

      {azureDevOps && (
        <TabbedLayout.Route path="/gittags" title="Git Tags">
          <AzureDevOpsGitTagsPage />
        </TabbedLayout.Route>
      )}

      {azureDevOps && (
        <TabbedLayout.Route path="/readme" title="Readme">
          <AzureReadmeCard />
        </TabbedLayout.Route>
      )}

      {sonarQube && (
        <TabbedLayout.Route path="/sonarqube" title="SonarQube">
          <EntitySonarQubeContentPage />
        </TabbedLayout.Route>
      )}

    </TabbedLayout>
  );
}