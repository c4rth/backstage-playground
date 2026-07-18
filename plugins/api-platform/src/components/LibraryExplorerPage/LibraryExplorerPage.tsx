import { LibraryTable } from '../LibraryTable';
import { ServiceLibrariesTable } from './ServiceLibrariesTable';
import {
  Container,
  FullPage,
  PluginHeader,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from '@backstage/ui';
import { RiBookShelfLine } from '@remixicon/react';

export const LibraryExplorerPage = () => {
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
