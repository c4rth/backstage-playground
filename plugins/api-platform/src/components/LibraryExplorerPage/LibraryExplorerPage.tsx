import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { LibraryTable } from '../LibraryTable';
import { useMemo, } from 'react';

export const LibraryExplorerPage = () => {
  const configApi = useApi(configApiRef);

  const generatedSubtitle = useMemo(() =>
    `${configApi.getOptionalString('organization.name') ?? 'Backstage'} Library Explorer`,
    [configApi]
  );

  return (
    <PageWithHeader
      themeId="libraries"
      title="Libraries"
      subtitle={generatedSubtitle}
      pageTitleOverride="Libraries"
    >
      <Content>
        <LibraryTable />
      </Content>
    </PageWithHeader>
  );
};