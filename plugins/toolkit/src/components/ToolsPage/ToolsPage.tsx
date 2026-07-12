import { Header, Page } from '@backstage/core-components';
import { ToolsContainer } from './ToolsContainer';
import { Container, FullPage } from '@backstage/ui';

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
    <FullPage style={{ height: '90vh' }}>
      <Container style={{ height: '90vh' }} mb="0">
        <ToolsContainer />
      </Container>
    </FullPage>
  );
};
