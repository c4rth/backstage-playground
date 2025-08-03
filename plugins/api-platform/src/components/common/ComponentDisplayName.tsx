import ExtensionIcon from '@material-ui/icons/Extension';
import CategoryIcon from '@material-ui/icons/Category';
import MuiMemoryIcon from '@material-ui/icons/Memory';
import Box from '@material-ui/core/Box';
import { Theme, makeStyles } from '@material-ui/core/styles';

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
    type: 'api' | 'system' | 'service';
};

export const ComponentDisplayName = ({ text, type }: ComponentDisplayNameProps): React.JSX.Element => {
    const classes = useStyles();
    return (
        <Box component="span" className={classes.root}>
            {type === 'api' && (
                <ExtensionIcon className={classes.icon} fontSize="inherit" />
            )}
            {type === 'system' && (
                <CategoryIcon className={classes.icon} fontSize="inherit" />
            )}
            {type === 'service' && (
                <MuiMemoryIcon className={classes.icon} fontSize="inherit" />
            )}
            {text}
        </Box>
    );
};