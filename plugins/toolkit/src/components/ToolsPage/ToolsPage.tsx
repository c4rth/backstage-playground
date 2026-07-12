import { Header, Page } from '@backstage/core-components';
import { ToolsContainer } from './ToolsContainer';
import { FullPage } from '@backstage/ui';

export const ToolsPage = () => {
  return (
    <Page themeId="tool">
      <Header title="Dev Tools" />
      <ToolsContainer />
    </Page>
  );
};

export const NfsToolsPage = () => {
  return (
    <FullPage style={{ height: '92vh' }}>
      <ToolsContainer />
    </FullPage>
  );
};
