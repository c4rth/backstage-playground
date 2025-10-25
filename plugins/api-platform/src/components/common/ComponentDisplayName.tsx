import Box from '@material-ui/core/Box';
import { Theme, makeStyles } from '@material-ui/core/styles';
import { AzureDevOpsIcon } from '@internal/plugin-api-platform-react';
import { RiPuzzleFill, RiShapesFill, RiCpuLine, RiGlobalLine } from '@remixicon/react'

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

export type ComponentDisplayNameProps = {
    text: string;
    type: 'api' | 'system' | 'service' | 'azdo' | 'url';
};

export const ComponentDisplayName = ({ text, type }: ComponentDisplayNameProps): React.JSX.Element => {
    const classes = useStyles();
    return (
        <Box component="span" className={classes.root}>
            {type === 'api' && (
                <RiPuzzleFill className={classes.icon} fontSize="inherit" size='16px'/>
            )}
            {type === 'system' && (
                <RiShapesFill className={classes.icon} fontSize="inherit" size='16px'/>
            )}
            {type === 'service' && (
                <RiCpuLine className={classes.icon} fontSize="inherit" size='16px'/>
            )}
            {type === 'azdo' && (
                <AzureDevOpsIcon className={classes.icon} fontSize="inherit" size='16px'/>
            )}
            {type === 'url' && (
                <RiGlobalLine className={classes.icon} fontSize="inherit" size='16px'/>
            )}
            {text}
        </Box>
    );
};