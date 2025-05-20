import { ReactNode } from 'react';
import {
  IndexableDocument,
  ResultHighlight,
} from '@backstage/plugin-search-common';
import { Box, Chip, ListItemIcon, ListItemText, makeStyles, Typography } from '@material-ui/core';
import { HighlightedSearchResultText } from '@backstage/plugin-search-react';
import { Link } from '@backstage/core-components';

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
            <Typography
              component="span"
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: props.lineClamp,
                overflow: 'hidden',
              }}
              color="textSecondary"
              variant="body2"
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
            </Typography>
          }
        />
        <Box>
          {result.applicationCode && <Chip label={`Application Code: ${result.applicationCode}`} size="small" />}
          {result.prdVersion && <Chip label={`PRD: ${result.prdVersion}`} size="small" />}
          {result.otherVersions && result.otherVersions.length > 0 && <Chip label={`Other versions: ${result.otherVersions}`} size="small" />}
        </Box>
      </div>
    </div>
  );
};