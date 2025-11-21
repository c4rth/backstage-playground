import { ReactNode } from 'react';
import {
  IndexableDocument,
  ResultHighlight,
} from '@backstage/plugin-search-common';
import { ListItemIcon, ListItemText, makeStyles } from '@material-ui/core';
import { HighlightedSearchResultText } from '@backstage/plugin-search-react';
import { Link } from '@backstage/core-components';
import { Box, Text, Flex } from '@backstage/ui';
import { Chip } from '@internal/plugin-api-platform-react';

const useStyles = makeStyles(
  {
    itemText: {
      width: '100%',
      wordBreak: 'break-all',
      marginBottom: '1rem',
    },
  },
  { name: 'CatalogSearchResultListItem' },
);

export interface McaComponentSearchResultListItemProps {
  icon?: ReactNode | ((result: IndexableDocument) => ReactNode);
  result?: IndexableDocument;
  highlight?: ResultHighlight;
  rank?: number;
  lineClamp?: number;
}

export function McaComponentSearchResultListItem(
  props: McaComponentSearchResultListItemProps,
) {

  const result = props.result as any;
  const highlight = props.highlight as ResultHighlight;

  const classes = useStyles();

  if (!result) return null;

  return (
    <Flex>
      {props.icon && (
        <ListItemIcon>
          {typeof props.icon === 'function' ? props.icon(result) : props.icon}
        </ListItemIcon>
      )}
      <Flex style={{ flexWrap: 'wrap'}}>
        <ListItemText
          className={classes.itemText}
          primaryTypographyProps={{ variant: 'h6' }}
          primary={
            <Link noTrack to={result.location}>
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
          }
        />
        <Box>
          {result.applicationCode && <Chip label={`Application Code: ${result.applicationCode}`} size="small" style={{ marginRight: '0.5rem' }} />}
          {result.prdVersion && <Chip label={`PRD: ${result.prdVersion}`} size="small" style={{ marginRight: '0.5rem' }} />}
          {result.otherVersions && result.otherVersions.length > 0 && <Chip label={`Other versions: ${result.otherVersions}`} size="small" />}
        </Box>
      </Flex>
    </Flex>
  );
};