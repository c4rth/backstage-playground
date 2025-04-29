import {
    PageWithHeader,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { IFramePage } from '@internal/plugin-iframe';
import { useParams } from 'react-router-dom';


export const McaBaseTypePage = () => {

    const { name } = useParams();
    const configApi = useApi(configApiRef);

    const baseTypesUrl = configApi.getString('mcaComponents.baseTypesUrl');

    const convertedName = name?.replace(/\./g, '/');
    const url = `${baseTypesUrl}/java/io/BufferedInputStream.html`;

    return (
        <PageWithHeader
            themeId="apis"
            title={`MCA BaseType - ${name}`}
            subtitle={convertedName}>
            <IFramePage
                title="BaseType"
                iframe={{
                    src: url,
                    height: '100%',
                    width: '100%',
                }}
            />
        </PageWithHeader>
    );
}