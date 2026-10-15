import { SystemTable } from '../SystemTable';
import { useDocumentTitle } from '@internal/plugin-components-react';
import {
  InformationPopup,
  InformationPopupContent,
} from '@internal/plugin-components-react';
import { getStringForKey } from '../common';
import { FullPage, PluginHeader } from '@backstage/ui';

const POPUP_CONTENT = (
  <InformationPopupContent
    text1={getStringForKey('SystemPlatformExplorerPage.text1')}
    text2={getStringForKey('SystemPlatformExplorerPage.text2')}
  />
);

export const SystemExplorerPage = () => {
  useDocumentTitle('System Explorer');
  return (
    <>
      <PluginHeader
        title="Systems"
        customActions={<InformationPopup content={POPUP_CONTENT} />}
      />
      <FullPage>
        <SystemTable />
      </FullPage>
    </>
  );
};
