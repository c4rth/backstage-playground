import { Page, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { CompoundEntityRef } from '@backstage/catalog-model';
import { useRouteRefParams, } from '@backstage/core-plugin-api';

import { IFramePage } from '@internal/plugin-iframe';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { CustomDocsReaderPageHeader } from './CustomDocsReaderPageHeader';
import { useCatalogEntity } from '../../hooks';
import { extractUrl, isExternalUrl } from '../../lib/helper';
import { rootDocsRouteRef } from '../../routes';
import { TechDocsReaderPage, TechDocsReaderPageContent, } from '@backstage/plugin-techdocs';
import { Mermaid } from 'backstage-plugin-techdocs-addon-mermaid';

export type CustomDocsReaderPageProps = {
    entityRef?: CompoundEntityRef;
};

export const CustomDocsReaderPage = (props: CustomDocsReaderPageProps) => {
    const { kind, name, namespace } = useRouteRefParams(rootDocsRouteRef);
    const { entityRef = { kind, name, namespace } } = props;

    const { entity, loading, error } = useCatalogEntity(entityRef);

    if (error) {
        return <ResponseErrorPanel error={error} />;
    }

    if (loading) {
        return <Progress />
    }
    const techdocsRef = entity?.metadata.annotations?.['backstage.io/techdocs-ref'];
    const isExternal = isExternalUrl(techdocsRef);
    const url = extractUrl(techdocsRef);

    return (
        <>
            {isExternal ?
                <EntityProvider entity={entity}>
                    <Page themeId='documentation' >
                        <CustomDocsReaderPageHeader entity={entity} />
                        <IFramePage
                            title={entity?.metadata.name}
                            iframe={{
                                src: url,
                                height: '100%',
                                width: '100%',
                            }}
                        />
                    </Page >
                </EntityProvider>
                :
                <TechDocsReaderPage>
                    <CustomDocsReaderPageHeader entity={entity} />
                    <TechDocsReaderPageContent
                        withSearch
                    />
                    <Mermaid />
                </TechDocsReaderPage>
            }
        </>
    );
};