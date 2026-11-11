import { ToolsContainer } from './ToolsContainer';
import { Box, FullPage } from '@backstage/ui';
import { useDocumentTitle } from '@internal/plugin-components-react';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { toolkitTranslationRef } from '../../translation';

export const ToolsPage = () => {
  const { t } = useTranslationRef(toolkitTranslationRef);
  useDocumentTitle(t('page.documentTitle'));
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
