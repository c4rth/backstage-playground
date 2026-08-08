import { ServiceTable } from '../ServiceTable';
import {
  InformationPopup,
  InformationPopupContent,
} from '@internal/plugin-components-react';
import { getStringForKey } from '../common';
import { FullPage, PluginHeader } from '@backstage/ui';
import { RiCpuLine } from '@remixicon/react';

const INFO_POPUP_CONTENT = (
  <InformationPopupContent
    text1={getStringForKey('ServicePlatformExplorerPage.text1')}
    text2={getStringForKey('ServicePlatformExplorerPage.text2')}
  />
);

export const ServiceExplorerPage = () => {
  return (
    <>
      <PluginHeader
        title="Services"
        icon={<RiCpuLine fontSize="inherit" />}
        customActions={<InformationPopup content={INFO_POPUP_CONTENT} />}
      />
      <FullPage>
        <ServiceTable />
      </FullPage>
    </>
  );
};
