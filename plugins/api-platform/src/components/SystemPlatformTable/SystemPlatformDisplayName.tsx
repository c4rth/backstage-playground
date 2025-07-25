import CategoryIcon from '@material-ui/icons/Category';
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

export type SystemPlatformDisplayNameProps = {
    name: string;
};

export const SystemPlatformDisplayName = ({ name }: SystemPlatformDisplayNameProps): React.JSX.Element => {
    const classes = useStyles();
    return (
        <Box component="span" className={classes.root}>
            <CategoryIcon className={classes.icon} fontSize="inherit" />
            <span>{name}</span>
        </Box>
    );
};