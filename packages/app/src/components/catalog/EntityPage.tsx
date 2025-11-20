import {
  EntityApiDefinitionCard,
  EntityConsumedApisCard,
  EntityConsumingComponentsCard,
  EntityHasApisCard,
  EntityProvidedApisCard,
  EntityProvidingComponentsCard,
} from '@backstage/plugin-api-docs';
import {
  EntityAboutCard,
  EntityDependsOnComponentsCard,
  EntityDependsOnResourcesCard,
  EntityHasComponentsCard,
  EntityHasSubcomponentsCard,
  EntityHasSystemsCard,
  EntityLayout,
  EntitySwitch,
  EntityOrphanWarning,
  EntityProcessingErrorsPanel,
  isComponentType,
  isKind,
  hasCatalogProcessingErrors,
  isOrphan,
  hasRelationWarnings,
  EntityRelationWarning,
} from '@backstage/plugin-catalog';
import {
  EntityUserProfileCard,
  EntityGroupProfileCard,
  EntityMembersListCard,
  EntityOwnershipCard,
} from '@backstage/plugin-org';
import { EntityTechdocsContent } from '@backstage/plugin-techdocs';
import { EmptyState } from '@backstage/core-components';
import {
  Direction,
  EntityCatalogGraphCard,
} from '@backstage/plugin-catalog-graph';
import {
  RELATION_API_CONSUMED_BY,
  RELATION_API_PROVIDED_BY,
  RELATION_CONSUMES_API,
  RELATION_DEPENDENCY_OF,
  RELATION_DEPENDS_ON,
  RELATION_HAS_PART,
  RELATION_PART_OF,
  RELATION_PROVIDES_API,
} from '@backstage/catalog-model';
import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
// SonarQube
import { EntitySonarQubeContentPage } from '@backstage-community/plugin-sonarqube';
import { isSonarQubeAvailable } from '@backstage-community/plugin-sonarqube-react';
// Azure Devops
import {
  EntityAzurePipelinesContent,
  isAzurePipelinesAvailable,
  isAzureDevOpsAvailable,
} from '@backstage-community/plugin-azure-devops';
// Spectral 
import { EntityApiDocsSpectralLinterContent, isApiDocsSpectralLinterAvailable } from '@internal/plugin-api-docs-spectral-linter';
// Techdocs
import { Mermaid } from '@internal/plugin-techdocs-addon-mermaid';
import { Button, Grid, Link } from '@backstage/ui';

const techdocsContent = (
  <EntityTechdocsContent>
    <TechDocsAddons>
      <Mermaid />
    </TechDocsAddons>
  </EntityTechdocsContent>
);

const cicdContent = (
  // This is an example of how you can implement your company's logic in entity page.
  // You can for example enforce that all components of type 'service' should use GitHubActions
  <EntitySwitch>

    <EntitySwitch.Case if={isAzureDevOpsAvailable}>
      <EntityAzurePipelinesContent defaultLimit={25} />
    </EntitySwitch.Case>
    <EntitySwitch.Case if={isAzurePipelinesAvailable}>
      <EntityAzurePipelinesContent defaultLimit={25} />
    </EntitySwitch.Case>

    <EntitySwitch.Case>
      <EmptyState
        title="No CI/CD available for this entity"
        missing="info"
        description="You need to add an annotation to your component if you want to enable CI/CD for it. You can read more about annotations in Backstage by clicking the button below."
        action={
          <Button
            variant="primary">
            <Link target="_blank" rel="noopener noreferrer" href="https://backstage.io/docs/features/software-catalog/well-known-annotations">
              Read more
            </Link>
          </Button>
        }
      />
    </EntitySwitch.Case>
  </EntitySwitch>
);

const entityWarningContent = (
  <>
    <EntitySwitch>
      <EntitySwitch.Case if={isOrphan}>
        <Grid.Root columns='1'>
          <Grid.Item>
          <EntityOrphanWarning />
          </Grid.Item>
        </Grid.Root>
      </EntitySwitch.Case>
    </EntitySwitch>

    <EntitySwitch>
      <EntitySwitch.Case if={hasRelationWarnings}>
        <Grid.Root columns='1'>
          <Grid.Item>
          <EntityRelationWarning />
          </Grid.Item>
        </Grid.Root>
      </EntitySwitch.Case>
    </EntitySwitch>

    <EntitySwitch>
      <EntitySwitch.Case if={hasCatalogProcessingErrors}>
        <Grid.Root columns='1'>
          <Grid.Item>
            <EntityProcessingErrorsPanel />
          </Grid.Item>
        </Grid.Root>
      </EntitySwitch.Case>
    </EntitySwitch>
  </>
);

const overviewContent = (
  <Grid.Root columns='2'>
    {entityWarningContent}
    <Grid.Item>
      <EntityAboutCard variant="gridItem" />
    </Grid.Item>
    <Grid.Item>
      <EntityCatalogGraphCard variant="gridItem" height={400} />
    </Grid.Item>
    <Grid.Item>
      <EntityHasSubcomponentsCard variant="gridItem" tableOptions={{ columnResizable: true }} />
    </Grid.Item>
  </Grid.Root>
);

const serviceEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/ci-cd" title="CI/CD">
      {cicdContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/api" title="API">
      <Grid.Root columns='2'>
        <Grid.Item>
          <EntityProvidedApisCard />
        </Grid.Item>
        <Grid.Item>
          <EntityConsumedApisCard />
        </Grid.Item>
      </Grid.Root>
    </EntityLayout.Route>

    <EntityLayout.Route path="/dependencies" title="Dependencies">
      <Grid.Root columns='2'>
        <Grid.Item>
          <EntityDependsOnComponentsCard variant="gridItem" />
        </Grid.Item>
        <Grid.Item>
          <EntityDependsOnResourcesCard variant="gridItem" />
        </Grid.Item>
      </Grid.Root>
    </EntityLayout.Route>

    <EntityLayout.Route path="/docs" title="Docs">
      {techdocsContent}
    </EntityLayout.Route>

    <EntityLayout.Route if={isSonarQubeAvailable} path="/sonarqube" title="SonarQube">
      <EntitySonarQubeContentPage />
    </EntityLayout.Route>
  </EntityLayout>
);

const websiteEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/ci-cd" title="CI/CD">
      {cicdContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/dependencies" title="Dependencies">
      <Grid.Root columns='2'>
        <Grid.Item>
          <EntityDependsOnComponentsCard variant="gridItem" />
        </Grid.Item>
        <Grid.Item>
          <EntityDependsOnResourcesCard variant="gridItem" />
        </Grid.Item>
      </Grid.Root>
    </EntityLayout.Route>

    <EntityLayout.Route path="/docs" title="Docs">
      {techdocsContent}
    </EntityLayout.Route>
  </EntityLayout>
);

/**
 * NOTE: This page is designed to work on small screens such as mobile devices.
 * This is based on Material UI Grid. If breakpoints are used, each grid item must set the `xs` prop to a column size or to `true`,
 * since this does not default. If no breakpoints are used, the items will equitably share the available space.
 * https://material-ui.com/components/grid/#basic-grid.
 */

const defaultEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/docs" title="Docs">
      {techdocsContent}
    </EntityLayout.Route>
  </EntityLayout>
);

const componentPage = (
  <EntitySwitch>
    <EntitySwitch.Case if={isComponentType('service')}>
      {serviceEntityPage}
    </EntitySwitch.Case>

    <EntitySwitch.Case if={isComponentType('website')}>
      {websiteEntityPage}
    </EntitySwitch.Case>

    <EntitySwitch.Case>{defaultEntityPage}</EntitySwitch.Case>
  </EntitySwitch>
);

const apiPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid.Root columns='2'>
        {entityWarningContent}
        <Grid.Item>
          <EntityAboutCard />
        </Grid.Item>
        <Grid.Item>
          <EntityCatalogGraphCard variant="gridItem" height={400} />
        </Grid.Item>
        <Grid.Root columns='2'>
          <Grid.Item>
            <EntityProvidingComponentsCard />
          </Grid.Item>
          <Grid.Item>
            <EntityConsumingComponentsCard />
          </Grid.Item>
        </Grid.Root>
      </Grid.Root>
    </EntityLayout.Route>

    <EntityLayout.Route path="/definition" title="Definition">
      <Grid.Root columns='1'>
        <Grid.Item>
          <EntityApiDefinitionCard />
        </Grid.Item>
      </Grid.Root>
    </EntityLayout.Route>

    <EntityLayout.Route if={isApiDocsSpectralLinterAvailable} path="/linter" title="Linter">
      <EntityApiDocsSpectralLinterContent />
    </EntityLayout.Route>
  </EntityLayout>
);

const userPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid.Root columns='2'>
        {entityWarningContent}
        <Grid.Item>
          <EntityUserProfileCard variant="gridItem" />
        </Grid.Item>
        <Grid.Item>
          <EntityOwnershipCard variant="gridItem" />
        </Grid.Item>
      </Grid.Root>
    </EntityLayout.Route>
  </EntityLayout>
);


const groupPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid.Root columns='1'>
        {entityWarningContent}
        <Grid.Item>
          <EntityGroupProfileCard variant="gridItem" />
        </Grid.Item>
        <Grid.Item>
          <EntityOwnershipCard variant="gridItem" />
        </Grid.Item>
        <Grid.Item>
          <EntityMembersListCard />
        </Grid.Item>
      </Grid.Root>
    </EntityLayout.Route>
  </EntityLayout>
);

const systemPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid.Root columns='2'>
        {entityWarningContent}
        <Grid.Item>
          <EntityAboutCard variant="gridItem" />
        </Grid.Item>
        <Grid.Item>
          <EntityCatalogGraphCard variant="gridItem" height={400} />
        </Grid.Item>
      </Grid.Root>
    </EntityLayout.Route>
    <EntityLayout.Route path="/components" title="Components">
      <EntityHasComponentsCard variant="gridItem"
        tableOptions={{
          search: true,
          paging: true,
          pageSize: 15
        }
        } />
    </EntityLayout.Route>
    <EntityLayout.Route path="/apis" title="APIS">
      <EntityHasApisCard variant="gridItem"
        tableOptions={{
          search: true,
          paging: true,
          pageSize: 15
        }
        } />
    </EntityLayout.Route>
    <EntityLayout.Route path="/diagram" title="Diagram">
      <EntityCatalogGraphCard
        variant="gridItem"
        direction={Direction.TOP_BOTTOM}
        title="System Diagram"
        height={700}
        relations={[
          RELATION_PART_OF,
          RELATION_HAS_PART,
          RELATION_API_CONSUMED_BY,
          RELATION_API_PROVIDED_BY,
          RELATION_CONSUMES_API,
          RELATION_PROVIDES_API,
          RELATION_DEPENDENCY_OF,
          RELATION_DEPENDS_ON,
        ]}
        unidirectional={false}
      />
    </EntityLayout.Route>
  </EntityLayout>
);

const domainPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid.Root columns='2'>
        {entityWarningContent}
        <Grid.Item>
          <EntityAboutCard variant="gridItem" />
        </Grid.Item>
        <Grid.Item>
          <EntityCatalogGraphCard variant="gridItem" height={400} />
        </Grid.Item>
        <Grid.Item>
          <EntityHasSystemsCard variant="gridItem" />
        </Grid.Item>
      </Grid.Root>
    </EntityLayout.Route>
  </EntityLayout>
);

export const entityPage = (
  <EntitySwitch>
    <EntitySwitch.Case if={isKind('component')} children={componentPage} />
    <EntitySwitch.Case if={isKind('api')} children={apiPage} />
    <EntitySwitch.Case if={isKind('group')} children={groupPage} />
    <EntitySwitch.Case if={isKind('user')} children={userPage} />
    <EntitySwitch.Case if={isKind('system')} children={systemPage} />
    <EntitySwitch.Case if={isKind('domain')} children={domainPage} />

    <EntitySwitch.Case>{defaultEntityPage}</EntitySwitch.Case>
  </EntitySwitch>
);
