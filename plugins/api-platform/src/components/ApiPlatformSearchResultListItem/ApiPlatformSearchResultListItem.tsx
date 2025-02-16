import React, { ReactNode } from 'react';
import {
  IndexableDocument,
  ResultHighlight,
} from '@backstage/plugin-search-common';

export interface ApiPlatformSearchResultListItemProps {
  icon?: ReactNode | ((result: IndexableDocument) => ReactNode);
  result?: IndexableDocument;
  highlight?: ResultHighlight;
  rank?: number;
  lineClamp?: number;
}

export function ApiPlatformSearchResultListItem(
  props: ApiPlatformSearchResultListItemProps,
) {

  return (
    <>
      <h1>ApiPlatformSearchResultListItem</h1>
      <h2>{JSON.stringify(props.result)}</h2>
    </>
  );
};