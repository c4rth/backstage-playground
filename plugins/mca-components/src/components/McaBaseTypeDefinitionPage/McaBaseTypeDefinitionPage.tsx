import {
    PageWithHeader,
    Progress,
    ResponseErrorPanel,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { IFramePage } from '@internal/plugin-iframe';
import { useParams } from 'react-router-dom';
import { mcaComponentsBackendApiRef } from '../../api';
import { McaComponentsBackendApi } from '../../api/McaComponentsBackendApi';
import { useEffect, useState } from 'react';
import { McaBaseType } from '@internal/plugin-mca-components-common';

async function getBaseType(
    mcaApi: McaComponentsBackendApi,
    name: string,
): Promise<McaBaseType> {
    const mca = await mcaApi.getMcaBaseType(name);
    if (!mca) {
        throw new Error(`MCA basetype ${name} not found`);
    }
    return mca;
}

export const McaBaseTypeDefinitionPage = () => {
    const mcaApi = useApi(mcaComponentsBackendApiRef);
    const { name } = useParams();
    const configApi = useApi(configApiRef);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [baseType, setBaseType] = useState<McaBaseType | undefined>(undefined);

    useEffect(() => {
        getBaseType(mcaApi, name!).then(result => {
            setBaseType(result);
            setLoading(false);
        }).catch(err => {
            setError(err);
            setLoading(false);
        }
        );
    }, [name, mcaApi]);

    const baseTypesUrl = configApi.getString('mcaComponents.baseTypes.baseUrl');

    if (error) {
        return <ResponseErrorPanel error={error} />;
    }

    if (loading) {
        return <Progress />
    }

    const urlPackage = baseType?.packageName?.replace(/\./g, '/');
    const urlName = `${baseTypesUrl}/${urlPackage}/${baseType?.baseType}.html`;
    const url = `${baseTypesUrl}/dexia/opmk/basetypes/account/MCAccount.html`;

    return (
        <PageWithHeader
            themeId="apis"
            title={`MCA BaseType - ${name}`}
            subtitle={urlName}>
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