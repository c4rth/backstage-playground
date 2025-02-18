import CategoryIcon from '@material-ui/icons/Category';
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

export type SystemPlatformDisplayNameProps = {
    name: string;
};

export const SystemPlatformDisplayName = (
    props: SystemPlatformDisplayNameProps,
): JSX.Element => {

    const classes = useStyles();
    let content = <div>{props.name}</div>;
    content = (
        <Box component="span" className={classes.root}>
            <Box component="span" className={classes.icon}>
                <CategoryIcon fontSize="inherit" />
            </Box>
            {content}
        </Box>
    );

    return content;
};