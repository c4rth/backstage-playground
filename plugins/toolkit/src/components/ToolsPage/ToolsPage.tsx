import { ToolsContainer } from './ToolsContainer';
import { Box, FullPage } from '@backstage/ui';

export const ToolsPage = () => {
  return (
    <>
      <FullPage style={{ height: '90vh' }}>
        <Box style={{ height: '90vh' }} mb="0">
          <ToolsContainer />
        </Box>
      </FullPage>
    </>
  );
};
