import { Header, Page } from '@backstage/core-components';
import { ToolsContainer } from './ToolsContainer';

export const ToolsPage = () => {
  return (
    <Page themeId="tool">
      <Header title="Dev Tools" />
      <ToolsContainer />
    </Page>
  );
};
