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
import { useEffect, useState, useMemo } from 'react';
import { McaBaseType } from '@internal/plugin-mca-common';

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
  const configApi = useApi(configApiRef);
  const { name } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [baseType, setBaseType] = useState<McaBaseType>();

  const baseTypesUrl = useMemo(() => {
    try {
      return configApi.getString('mcaComponents.baseTypes.baseUrl');
    } catch (configError) {
      return '';
    }
  }, [configApi]);

  useEffect(() => {
    getBaseType(mcaApi, name!)
      .then(result => {
        setBaseType(result);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [name, mcaApi]);

  const baseTypeUrl = useMemo(() => {
    if (!baseType || !baseTypesUrl) {
      return undefined;
    }

    const packageUrl = baseType.packageName?.replace(/\./g, '/') || '';
    const constructedUrl = `${baseTypesUrl}/${packageUrl}/${baseType.baseType}.html`;

    return constructedUrl;
  }, [baseType, baseTypesUrl]);

  const pageProps = useMemo(() => ({
    title: `${name || 'Unknown'}`,
    subtitle: baseTypeUrl || 'Loading...',
  }), [name, baseTypeUrl]);

  const iframeProps = useMemo(() => ({
    title: `BaseType :${baseTypeUrl}`,
    iframe: {
      src: baseTypeUrl || '',
      height: '100%' as const,
      width: '100%' as const,
    },
  }), [baseTypeUrl]);

  if (error) return <ResponseErrorPanel error={error} />;
  if (loading) return <Progress />;
  if (!baseTypesUrl) {
    return (
      <ResponseErrorPanel
        error={new Error('Base types URL not configured. Please check mcaComponents.baseTypes.baseUrl in app-config.yaml')}
      />
    );
  }

  return (
    <PageWithHeader
      key={name} // Force re-render when name changes
      themeId="apis"
      title={pageProps.title}
      type='MCA BaseType'
    >
      <IFramePage {...iframeProps} />
    </PageWithHeader>
  );
}