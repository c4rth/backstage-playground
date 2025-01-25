import { Entity } from '@backstage/catalog-model';
import ExtensionIcon from '@material-ui/icons/Extension';
import { API_PLATFORM_API_NAME_ANNOTATION } from '@internal/plugin-api-platform-common';
import Box from '@material-ui/core/Box';
import { Theme, makeStyles } from '@material-ui/core/styles';
import React from 'react';

export type CatalogReactEntityDisplayNameClassKey = 'root' | 'icon';

const useStyles = makeStyles(
    (theme: Theme) => ({
        root: {
            display: 'inline-flex',
            alignItems: 'center',
            textDecoration: 'inherit',
        },
        icon: {
            marginRight: theme.spacing(0.5),
            color: theme.palette.text.secondary,
            '& svg': {
                verticalAlign: 'middle',
            },
        },
    }),
    { name: 'CatalogReactEntityDisplayName' },
);

export type ApiDisplayNameProps = {
    entityRef: Entity;
};

export const ApiDisplayName = (
    props: ApiDisplayNameProps,
): JSX.Element => {
    const { entityRef } = props;

    const classes = useStyles();
    const primaryTitle = entityRef.metadata[API_PLATFORM_API_NAME_ANNOTATION]?.toString() || 'api-name not found';

    let content = <div>{primaryTitle}</div>;
    content = (
        <Box component="span" className={classes.root}>
            <Box component="span" className={classes.icon}>
                <ExtensionIcon fontSize="inherit" />
            </Box>
            {content}
        </Box>
    );

    return content;
};