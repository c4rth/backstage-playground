import {
  MarkdownContent,
  EmptyState,
  ErrorPanel,
} from '@backstage/core-components';
import { EntityInfoCard } from '@backstage/plugin-catalog-react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useReadme } from '../../hooks';
import { Box, ButtonLink, Link } from '@backstage/ui';
import { Progress } from '@internal/plugin-components-react';

type Props = {
  maxHeight?: number;
};

type ErrorProps = {
  error: Error;
};

function isNotFoundError(error: any): boolean {
  return error?.response?.status === 404;
}

const ReadmeCardError = ({ error }: ErrorProps) => {
  if (isNotFoundError(error)) {
    return (
      <EmptyState
        title="No README available for this service"
        missing="field"
        description="You can add a README to your service by following the Azure DevOps documentation."
        action={
          <ButtonLink
            variant="primary"
            href="https://docs.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read more
          </ButtonLink>
        }
      />
    );
  }
  return <ErrorPanel title={error.message} error={error} />;
};

export const AzureReadmeCard = (props: Props) => {
  const { entity } = useEntity();
  const { loading, error, item: value } = useReadme(entity);

  if (error) {
    return <ReadmeCardError error={error} />;
  } else if (loading) {
    return <Progress />;
  }

  return (
    <EntityInfoCard
      title="Readme"
      headerActions={
        <Link href={value!.url} target="_blank" rel="noopener noreferrer">
          Open README
        </Link>
      }
    >
      <Box style={{ maxHeight: props.maxHeight }}>
        <MarkdownContent content={value?.content ?? ''} />
      </Box>
    </EntityInfoCard>
  );
};
