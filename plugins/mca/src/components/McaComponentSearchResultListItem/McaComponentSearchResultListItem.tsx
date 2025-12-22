import { ReactNode } from 'react';
import {
  IndexableDocument,
  ResultHighlight,
} from '@backstage/plugin-search-common';
import { HighlightedSearchResultText } from '@backstage/plugin-search-react';
import { Link } from '@backstage/core-components';
import { Box, Text, } from '@backstage/ui';
import { Chip } from '@internal/plugin-api-platform-react';
import { RiAlbumLine } from '@remixicon/react';

function getIcon(kind: string, defaultIcon: ReactNode) {
  if (kind === 'BaseType') {
    return <RiAlbumLine />;
  }
  return defaultIcon;
}

export interface McaComponentSearchResultListItemProps {
  icon?: ReactNode | ((result: IndexableDocument) => ReactNode);
  result?: IndexableDocument;
  highlight?: ResultHighlight;
  rank?: number;
  lineClamp?: number;
}

export const McaComponentSearchResultListItem = (props: McaComponentSearchResultListItemProps) => {

  const result = props.result as any;
  const highlight = props.highlight as ResultHighlight;

  if (!result) return null;

  return (
    <Box style={{ display: 'flex' }}>
      {props.icon && (
        <Box style={{ display: 'flex', alignItems: 'flex-start', marginRight: '1rem' }}>
          {typeof props.icon === 'function' ? props.icon(result) : getIcon(result.kind, props.icon)}
        </Box>
      )}
      <Box style={{ flexWrap: 'wrap', flex: 1, marginLeft: '20px' }}>
        <Box style={{ width: '100%', wordBreak: 'break-all', marginBottom: '1rem' }}>
          <Link noTrack to={result.location}>
            <Text weight='bold' style={{ color: 'var(--bui-fg-link)', fontSize: '20px' }}>
              {highlight?.fields.title ? (
                <HighlightedSearchResultText
                  text={highlight.fields.title}
                  preTag={highlight.preTag}
                  postTag={highlight.postTag}
                />
              ) : (
                result.title
              )}
            </Text>
          </Link>
          <Text
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: props.lineClamp,
              overflow: 'hidden',
            }}
            color="secondary"
            variant='body-medium'
          >
            {highlight?.fields.text ? (
              <HighlightedSearchResultText
                text={highlight.fields.text}
                preTag={highlight.preTag}
                postTag={highlight.postTag}
              />
            ) : (
              result.text
            )}
          </Text>
        </Box>
        <Box>
          {result.kind && <Chip label={`Kind: ${result.kind}`} size="small" style={{ marginRight: '0.5rem' }} />}
          {result.applicationCode && <Chip label={`Application Code: ${result.applicationCode}`} size="small" style={{ marginRight: '0.5rem' }} />}
          {result.prdVersion && <Chip label={`PRD: ${result.prdVersion}`} size="small" style={{ marginRight: '0.5rem' }} />}
          {result.otherVersions && result.otherVersions.length > 0 && <Chip label={`Other versions: ${result.otherVersions}`} size="small" />}
        </Box>
      </Box>
    </Box>
  );
};