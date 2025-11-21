import { ReactNode } from 'react';
import {
  IndexableDocument,
  ResultHighlight,
} from '@backstage/plugin-search-common';
import { HighlightedSearchResultText } from '@backstage/plugin-search-react';
import { Link } from '@backstage/core-components';
import { Box, Text } from '@backstage/ui';
import { Chip } from '@internal/plugin-api-platform-react';

// TODO-MUI
import { ListItemIcon, ListItemText, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(
  {
    item: {
      display: 'flex',
    },
    flexContainer: {
      flexWrap: 'wrap',
    },
    itemText: {
      width: '100%',
      wordBreak: 'break-all',
      marginBottom: '1rem',
    },
  },
  { name: 'CatalogSearchResultListItem' },
);

export interface ApiPlatformSearchResultListItemProps {
  icon?: ReactNode | ((result: IndexableDocument) => ReactNode);
  result?: IndexableDocument;
  highlight?: ResultHighlight;
  rank?: number;
  lineClamp?: number;
}

function renderChips(result: any) {
  return (
    <Box>
      {result.kind && <Chip label={`Kind: ${result.kind}`} size="small" style={{ marginRight: '0.5rem' }} />}
      {result.type && <Chip label={`Type: ${result.type}`} size="small" style={{ marginRight: '0.5rem' }} />}
      {result.lifecycle && <Chip label={`lifecycle: ${result.lifecycle}`} size="small" style={{ marginRight: '0.5rem' }} />}
      {result.owner && <Chip label={`Owner: ${result.owner}`} size="small" />}
    </Box>
  );
}

export function ApiPlatformSearchResultListItem(
  props: ApiPlatformSearchResultListItemProps,
) {
  const result = props.result as any;
  const highlight = props.highlight as ResultHighlight;
  const classes = useStyles();

  if (!result) return null;

  return (
    <div className={classes.item}>
      {props.icon && (
        <ListItemIcon>
          {typeof props.icon === 'function' ? props.icon(result) : props.icon}
        </ListItemIcon>
      )}
      <div className={classes.flexContainer}>
        <ListItemText
          className={classes.itemText}
          primaryTypographyProps={{ variant: 'h6' }}
          primary={
            <Link noTrack to={result.apiPlatformLocation}>
              {highlight?.fields.title ? (
                <HighlightedSearchResultText
                  text={highlight.fields.title}
                  preTag={highlight.preTag}
                  postTag={highlight.postTag}
                />
              ) : (
                result.title
              )}
            </Link>
          }
          secondary={
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
          }
        />
        {renderChips(result)}
      </div>
    </div>
  );
}