import { ToolsContainer } from './ToolsContainer';
import { Box, FullPage } from '@backstage/ui';

export const ToolsPage = () => {
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
