import { HomePageToolkit } from '@backstage/plugin-home';
import { useToolkitData } from '../../hooks/useToolkitData';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ToolkitLink } from '../../types/types';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';

export const ToolkitCard = () => {
  const configApi = useApi(configApiRef);
  const baseUrl = configApi.getString('app.baseUrl');
  const { data, error, isLoading } = useToolkitData(baseUrl) as {
    data: ToolkitLink[] | undefined;
    error: Error | undefined;
    isLoading: boolean;
  };

  const renderErrorPanel = (err: Error | string) => (
    <ResponseErrorPanel
      title="Could not fetch data."
      error={typeof err === 'string' ? new Error(err) : err}
    />
  );

  if (isLoading) return <Progress />;
  if (error) return renderErrorPanel(error);
  if (!data) return renderErrorPanel('Unknown error - no data');

  const tools = data.map(link => ({
    label: link.label,
    url: link.url,
    icon: (
      <img
        src={`${baseUrl}/${link.iconUrl}`}
        alt={link.label}
        style={{
          height: '38px',
          width: 'auto',
        }}
      />
    ),
  }));

  return <HomePageToolkit tools={tools} />;
};
