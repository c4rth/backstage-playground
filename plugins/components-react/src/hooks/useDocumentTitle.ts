import { useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { configApiRef } from '@backstage/core-plugin-api';

export const useDocumentTitle = (title: string) => {
  const appName =
    useApi(configApiRef).getOptionalString('app.title') ?? 'Backstage';
  useEffect(() => {
    document.title = title ? `${title} | ${appName}` : appName;

    return () => {
      document.title = appName;
    };
  }, [title]);
};
