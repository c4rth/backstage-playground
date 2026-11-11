import { ReactNode } from 'react';
import {
  IndexableDocument,
  ResultHighlight,
} from '@backstage/plugin-search-common';
import { HighlightedSearchResultText } from '@backstage/plugin-search-react';
import { Link } from '@backstage/core-components';
import { Box, Text } from '@backstage/ui';
import { Chip } from '@internal/plugin-components-react';
import { RiCpuLine, RiPuzzleFill, RiShapesFill } from '@remixicon/react';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { apiPlatformTranslationRef } from '../../translation';

export interface ApiSearchResultListItemProps {
  icon?: ReactNode | ((result: IndexableDocument) => ReactNode);
  result?: IndexableDocument;
  highlight?: ResultHighlight;
  rank?: number;
  lineClamp?: number;
}

function getIcon(kind: string, defaultIcon: ReactNode) {
  switch (kind) {
    case 'OpenAPI':
      return <RiPuzzleFill />;
    case 'System':
      return <RiShapesFill />;
    case 'Service':
      return <RiCpuLine />;
    default:
      return defaultIcon;
  }
}

export const ApiSearchResultListItem = (
  props: ApiSearchResultListItemProps,
) => {
  const { t } = useTranslationRef(apiPlatformTranslationRef);
  const result = props.result as any;
  const highlight = props.highlight as ResultHighlight;

  if (!result) return null;

  return (
    <Box style={{ display: 'flex' }}>
      {props.icon && (
        <Box
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            marginRight: '1rem',
          }}
        >
          {typeof props.icon === 'function'
            ? props.icon(result)
            : getIcon(result.kind, props.icon)}
        </Box>
      )}
      <Box style={{ flexWrap: 'wrap', flex: 1, marginLeft: '20px' }}>
        <Box
          style={{
            width: '100%',
            wordBreak: 'break-all',
            marginBottom: '1rem',
          }}
        >
          <Link noTrack to={result.apiPlatformLocation}>
            <Text
              weight="bold"
              style={{ color: 'var(--bui-fg-announcement)', fontSize: '20px' }}
            >
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
            variant="body-medium"
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
          {result.kind && (
            <Chip
              label={t('search.kind', { value: result.kind })}
              size="small"
              style={{ marginRight: '0.5rem' }}
            />
          )}
          {result.type && (
            <Chip
              label={t('search.type', { value: result.type })}
              size="small"
              style={{ marginRight: '0.5rem' }}
            />
          )}
          {result.lifecycle && (
            <Chip
              label={t('search.lifecycle', { value: result.lifecycle })}
              size="small"
              style={{ marginRight: '0.5rem' }}
            />
          )}
          {result.owner && (
            <Chip
              label={t('search.owner', { value: result.owner })}
              size="small"
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};
