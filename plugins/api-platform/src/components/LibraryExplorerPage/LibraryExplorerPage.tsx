import {
  Content,
  PageWithHeader,
  TabbedLayout,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { LibraryTable } from '../LibraryTable';
import { ServiceLibrariesTable } from '../ServiceTable';

export const LibraryExplorerPage = () => {
  const configApi = useApi(configApiRef);
  const orgName =
    configApi.getOptionalString('organization.name') ?? 'Backstage';

  return (
    <PageWithHeader
      themeId="libraries"
      title="Libraries"
      subtitle={`${orgName} Library Explorer`}
      pageTitleOverride="Libraries"
    >
      <Content>
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
      </Content>
    </PageWithHeader>
  );
};
