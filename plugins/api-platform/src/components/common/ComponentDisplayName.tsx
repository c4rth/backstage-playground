import { AzureDevOpsIcon } from '@internal/plugin-api-platform-react';
import { Box, Text } from '@backstage/ui';
import { RiPuzzleFill, RiShapesFill, RiCpuLine  } from '@remixicon/react'

// TODO-MUI
import { Theme, makeStyles } from '@material-ui/core/styles';

export type CatalogReactEntityDisplayNameClassKey = 'root' | 'icon';

const useStyles = makeStyles(
    (theme: Theme) => ({
        icon: {
            marginRight: theme.spacing(0.5),
            color: theme.palette.text.secondary,
            '& svg': {
                verticalAlign: 'middle',
            },
            size: '12px',
        },
    }),
);

export type ComponentDisplayNameProps = {
    text: string;
    type: 'api' | 'system' | 'service' | 'azdo';
};

export const ComponentDisplayName = ({ text, type }: ComponentDisplayNameProps): React.JSX.Element => {
    const classes = useStyles();
    return (
        <Box style={{
            display: 'inline-flex',
            alignItems: 'center',
            textDecoration: 'inherit',
        }}>
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
                <AzureDevOpsIcon className={classes.icon} fontSize="inherit" />
            )}
            <Text weight='bold' style={{ color: '#C30045' }}>
                {text}
            </Text>
        </Box>
    );
};