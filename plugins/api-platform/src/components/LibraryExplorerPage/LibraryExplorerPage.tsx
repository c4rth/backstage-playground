import {
  Content,
  PageWithHeader,
  TabbedLayout,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { LibraryTable } from '../LibraryTable';
import { ServiceLibrariesTable } from './ServiceLibrariesTable';
import { Container, FullPage, PluginHeader, Tab, TabList, TabPanel, Tabs } from '@backstage/ui';
import { RiBookShelfLine } from '@remixicon/react';

export const LibraryExplorerPage = () => {
  const configApi = useApi(configApiRef);
  const orgName =
    configApi.getOptionalString('organization.name') ?? 'Backstage';

  const pageContent = (
    <Content>
      <TabbedLayout>
        <TabbedLayout.Route path="/" title="Libraries">
          <LibraryTable />
        </TabbedLayout.Route>
        <TabbedLayout.Route path="/services" title="By services">
          <ServiceLibrariesTable />
        </TabbedLayout.Route>
      </TabbedLayout>
    </Content>
  );

  return (
    <PageWithHeader
      themeId="libraries"
      title="Libraries"
      subtitle={`${orgName} Library Explorer`}
      pageTitleOverride="Libraries"
    >
      {pageContent}
    </PageWithHeader>
  );
};

export const NfsLibraryExplorerPage = () => {

  return (
    <>
      <PluginHeader
        title="Libraries"
        icon={<RiBookShelfLine fontSize="inherit" />}
      />
      <FullPage>
        <Container>
          <Tabs>
            <TabList>
              <Tab id="tab1">Libaries</Tab>
              <Tab id="tab2">By services</Tab>
            </TabList>
            <TabPanel id="tab1">
              <LibraryTable />
            </TabPanel>
            <TabPanel id="tab2">
              <ServiceLibrariesTable />
            </TabPanel>
          </Tabs>
        </Container>
      </FullPage>
    </>
  );
};
