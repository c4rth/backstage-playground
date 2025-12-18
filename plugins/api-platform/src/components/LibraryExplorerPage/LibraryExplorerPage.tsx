import { Content, PageWithHeader } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { LibraryTable } from '../LibraryTable';

export const LibraryExplorerPage = () => {
  const configApi = useApi(configApiRef);
  const orgName = configApi.getOptionalString('organization.name') ?? 'Backstage';

  return (
    <PageWithHeader
      themeId="libraries"
      title="Libraries"
      subtitle={`${orgName} Library Explorer`}
      pageTitleOverride="Libraries"
    >
      <Content>
        <LibraryTable />
      </Content>
    </PageWithHeader>
  );
};