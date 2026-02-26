/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  InfoCard,
  Progress,
  MarkdownContent,
  EmptyState,
  ErrorPanel,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

import { useReadme } from '../../hooks';
import { Box, Button, ButtonLink, Link } from '@backstage/ui';

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
          <ButtonLink variant="primary" href='https://docs.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops' target="_blank" rel="noopener noreferrer">
            Read more
          </ButtonLink>
        }
      />
    );
  }
  return <ErrorPanel title={error.message} error={error} />;
};

export const ReadmeCard = (props: Props) => {
  const { entity } = useEntity();
  const { loading, error, item: value } = useReadme(entity);

  if (error) {
    return <ReadmeCardError error={error} />;
  } else if (loading) {
    return <Progress />;
  }

  return (
    <InfoCard
      title="Readme"
      deepLink={{
        link: value!.url,
        title: 'Readme',
      }}
    >
      <Box style={{ maxHeight: props.maxHeight }}>
        <MarkdownContent content={value?.content ?? ''} />
      </Box>
    </InfoCard>
  );
  
};