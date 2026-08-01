import { SystemTable } from '../SystemTable';
import {
  InformationPopup,
  InformationPopupContent,
} from '@internal/plugin-components-react';
import { getStringForKey } from '../common';
import { Container, FullPage, PluginHeader } from '@backstage/ui';

const POPUP_CONTENT = (
  <InformationPopupContent
    text1={getStringForKey('SystemPlatformExplorerPage.text1')}
    text2={getStringForKey('SystemPlatformExplorerPage.text2')}
  />
);

export const SystemExplorerPage = () => {
  return (
    <>
      <PluginHeader
        title="Systems"
        customActions={<InformationPopup content={POPUP_CONTENT} />}
      />
      <FullPage>
        <Container>
          <SystemTable />
        </Container>
      </FullPage>
    </>
  );
};
