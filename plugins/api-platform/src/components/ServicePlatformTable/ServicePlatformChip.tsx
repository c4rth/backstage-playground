import { ReactElement } from 'react';
import { Chip, Tooltip, Typography } from '@material-ui/core';
import { alpha, makeStyles, Theme } from '@material-ui/core/styles';
import { ServiceEnvironmentDefinition } from '@internal/plugin-api-platform-common';
import { Link } from '@backstage/core-components';
import PlatformAllIcon from '../icons/PlatformAllIcon';
import PlatformOnpremIcon from '../icons/PlatformOnpremIcon';
import PlatformAzureIcon from '../icons/PlatformAzureIcon';

export type ServicePlatformChipProps = {
    index: number;
    icon?: JSX.Element;
    text?: string;
    link: string;
    service?: ServiceEnvironmentDefinition;
    disabled?: boolean;
};

const useStyles = makeStyles<Theme, ServicePlatformChipProps>(
    (theme: Theme) => ({
        badge: {
            backgroundColor: (props: ServicePlatformChipProps) => alpha(theme.palette.primary.light, (props.index + 1) / 10),
        },
    }),
);

export const ServicePlatformChip = (
    props: ServicePlatformChipProps,
): JSX.Element => {
    const classes = useStyles(props);

    const handleClick = () => () => {
    };

    let icon: ReactElement;
    if (props.service?.platform.includes('azure') && props.service?.platform.includes('onprem')) {
        icon = <PlatformAllIcon />;
    } else if (props.service?.platform.includes('onprem')) {
        icon = <PlatformOnpremIcon />;
    } else {
        icon = <PlatformAzureIcon />;
    }

    return (
        props.text ?
            <Link to={props.link} style={{ padding: '0px', margin: '0px' }}>
                <Chip
                    key={props.text}
                    label={props.text}
                    size="small"
                    variant="outlined"
                    className={classes.badge}
                    clickable={!props.disabled}
                    disabled={props.disabled}
                    icon={props.icon}
                    style={{ padding: '0px', margin: '0px' }}
                /></Link>
            :
            <Link to={props.link} style={{ padding: '0px', margin: '0px' }}>
                <Tooltip
                    placement='bottom'
                    arrow
                    title={
                        <>
                            <Typography variant='caption'>Platform: <b>{props.service?.platform}</b></Typography><br />
                            <Typography variant='caption'>Version: <b>{props.service?.imageVersion}</b></Typography><br />
                        </>
                    }>

                    <Chip
                        key={props.service?.imageVersion}
                        label={props.service?.imageVersion}
                        size="small"
                        variant="outlined"
                        className={classes.badge}
                        clickable={!props.disabled}
                        disabled={props.disabled}
                        onClick={handleClick}
                        icon={icon}
                        style={{ padding: '5px', margin: '0px' }}
                    />
                </Tooltip>
            </Link>
    );
};
