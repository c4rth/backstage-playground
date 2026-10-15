import { ToolsContainer } from './ToolsContainer';
import { Box, FullPage } from '@backstage/ui';
import { useDocumentTitle } from '@internal/plugin-components-react';

export const ToolsPage = () => {
  useDocumentTitle('Dev Tools');
  return (
    <>
      <FullPage>
        <Box style={{ height: '100%' }} mb="0">
          <ToolsContainer />
        </Box>
      </FullPage>
    </>
  );
};
