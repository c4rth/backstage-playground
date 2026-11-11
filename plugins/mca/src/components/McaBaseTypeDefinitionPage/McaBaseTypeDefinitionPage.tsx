import { ResponseErrorPanel } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { NotFoundError } from '@backstage/errors';
import { useDocumentTitle } from '@internal/plugin-components-react';
import { mcaComponentsBackendApiRef } from '../../api';
import { McaComponentsBackendApi } from '../../api/McaComponentsBackendApi';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { McaBaseType } from '@internal/plugin-mca-common';
import { Container, FullPage, PluginHeader } from '@backstage/ui';
import { Progress } from '@internal/plugin-components-react';
import {
  useRouteRefParams,
  useTranslationRef,
} from '@backstage/frontend-plugin-api';
import { mcaTranslationRef, McaTranslator } from '../../translation';
import { baseTypeRouteRef } from '../../routes';
import { RiAlbumLine } from '@remixicon/react';

async function getBaseType(
  mcaApi: McaComponentsBackendApi,
  name: string,
  t: McaTranslator,
): Promise<McaBaseType> {
  const mca = await mcaApi.getMcaBaseType(name);
  if (!mca) {
    throw new NotFoundError(t('baseTypeDefinition.notFound', { name }));
  }
  return mca;
}

export const McaBaseTypeDefinitionPage = () => {
  const { t } = useTranslationRef(mcaTranslationRef);
  const mcaApi = useApi(mcaComponentsBackendApiRef);
  const configApi = useApi(configApiRef);
  const { name } = useRouteRefParams(baseTypeRouteRef);
  const navigate = useNavigate();
  useDocumentTitle(t('baseTypeDefinition.title', { name }));

  const [error, setError] = useState<Error | null>(null);
  const [baseType, setBaseType] = useState<McaBaseType>();
  const [iframeLoading, setIframeLoading] = useState(true);

  let backendBaseUrl = '';
  try {
    backendBaseUrl = configApi.getString('backend.baseUrl');
  } catch (configError) {
    // backendBaseUrl remains empty
  }

  useEffect(() => {
    getBaseType(mcaApi, name!, t)
      .then(result => {
        setBaseType(result);
      })
      .catch(err => {
        setError(err);
      });
  }, [name, mcaApi, t]);

  let baseTypeUrl: string | undefined;
  if (baseType && backendBaseUrl) {
    const searchParams = new URLSearchParams({
      packageName: baseType.packageName || '',
      'is-external': 'true',
    });
    baseTypeUrl = `${backendBaseUrl}/api/mca/basetypes/javadoc/${encodeURIComponent(baseType.baseType)}?${searchParams}`;
  }

  useEffect(() => {
    setIframeLoading(true);
  }, [baseTypeUrl]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== backendBaseUrl) return;

      const { type, baseType: linkedBaseType } = event.data ?? {};
      if (
        type !== 'mca-basetype-navigation' ||
        typeof linkedBaseType !== 'string'
      ) {
        return;
      }

      navigate(`/mca/basetypes/${encodeURIComponent(linkedBaseType)}`);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [backendBaseUrl, navigate]);

  if (error) return <ResponseErrorPanel error={error} />;
  if (!backendBaseUrl) {
    return (
      <ResponseErrorPanel
        error={new Error(t('baseTypeDefinition.missingBackend'))}
      />
    );
  }

  return (
    <>
      <PluginHeader
        icon={<RiAlbumLine fontSize="inherit" />}
        breadcrumbs={[
          { label: t('baseTypeDefinition.breadcrumb'), href: '/mca/basetypes' },
          { label: name, href: `` },
        ]}
      />
      <FullPage>
        {iframeLoading && <Progress />}
        <Container style={{ height: '100%' }}>
          <iframe
            src={baseTypeUrl || ''}
            height={iframeLoading ? 0 : '100%'}
            width={iframeLoading ? 0 : '100%'}
            style={{
              border: 0,
              visibility: iframeLoading ? 'hidden' : 'visible',
            }}
            title={t('baseTypeDefinition.frameTitle', {
              url: String(baseTypeUrl),
            })}
            onLoad={() => setIframeLoading(false)}
          />
        </Container>
      </FullPage>
    </>
  );
};
