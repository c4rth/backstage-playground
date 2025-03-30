import React from 'react';
import {
  Content,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { determineError } from './utils/helpers';
import { ErrorComponent } from './ErrorComponent';
import { IFrameContentProps } from './types';

const IFramePage = (props: IFrameContentProps) => {
  const { iframe } = props;
  const configApi = useApi(configApiRef);
  const allowList = configApi.getOptionalStringArray('iframe.allowList');
  const errorMessage = determineError(iframe?.src || '', allowList);

  if (errorMessage !== '') {
    return <ErrorComponent {...{ errorMessage }} />;
  }

  return (
    <Content noPadding>
      <iframe
        src={iframe.src}
        height={iframe.height || '100%'}
        width={iframe.width || '100%'}
        title={iframe.title}
      />
    </Content>
  );
};

export { IFramePage };