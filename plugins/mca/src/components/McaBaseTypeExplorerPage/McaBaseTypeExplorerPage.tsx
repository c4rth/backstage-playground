import {
  Content,
  PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { InformationPopup, InformationPopupContent } from '@internal/plugin-api-platform-react';
import { McaBaseTypeTable } from '../McaBaseTypeTable/McaBaseTypeTable';

const POPUP_CONTENT = (
    <InformationPopupContent
        text1="Explore all MCA base type definitions registered in Backstage. This screen provides a searchable and filterable table of base types, including their names and associated packages. Use this view to quickly find, review, and navigate to detailed information about each base type in your platform."
        text2="The MCA BaseType Explorer helps you maintain visibility and control over your organization's base types, making it easy to discover, document, and govern your technical building blocks."
    />
);

export const McaBaseTypeExplorerPage = () => {
    const configApi = useApi(configApiRef);
    
    const organizationName = configApi.getOptionalString('organization.name') ?? 'Backstage';
    const subtitle = `${organizationName} MCA BaseType Explorer`;
    const subtitleComponent = (
        <InformationPopup
            text={subtitle}
            content={POPUP_CONTENT}
        />
    );

    return (
        <PageWithHeader
            themeId="apis"
            title="MCA BaseTypes"
            subtitle={subtitleComponent}
            pageTitleOverride="MCA BaseTypes"
        >
            <Content>
                <McaBaseTypeTable />
            </Content>
        </PageWithHeader>
    );
}