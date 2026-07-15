import { ApiTable } from '../ApiTable';
import {
  InformationPopup,
  InformationPopupContent,
} from '@internal/plugin-api-platform-react';
import { getStringForKey } from '../common';
import { Container, FullPage, PluginHeader } from '@backstage/ui';
import { RiPuzzleFill } from '@remixicon/react';

const INFO_POPUP_CONTENT = (
  <InformationPopupContent
    text1={getStringForKey('ApiExplorerPage.text1')}
    text2={getStringForKey('ApiExplorerPage.text2')}
  />
);

export const ApiExplorerPage = () => {
  
  return (
    <>
      <PluginHeader
        title="APIs"
        icon={<RiPuzzleFill fontSize="inherit" />}
        customActions={<InformationPopup content={INFO_POPUP_CONTENT} />} />
      <FullPage>
        <Container>
          <ApiTable />
        </Container>
      </FullPage>
    </>
  );
};
