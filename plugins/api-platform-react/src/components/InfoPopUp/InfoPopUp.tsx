import { ReactNode, useMemo } from 'react';
import { Box, makeStyles, Typography } from '@material-ui/core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { Variant } from '@material-ui/core/styles/createTypography';
import { InfoPopOver } from '@internal/plugin-api-platform-react';

const useStyles = makeStyles(
    theme => ({
        container: {
            display: 'flex',
            alignItems: 'center',
        },
        subtitle: {
            color: theme.page.fontColor,
            opacity: 0.8,
            marginTop: theme.spacing(1),
            maxWidth: '75ch',
        },
        icon: {
            color: theme.page.fontColor,
            marginTop: theme.spacing(1),
            marginLeft: theme.spacing(1),
            opacity: 0.8,
            fontSize: '1.2rem',
            cursor: 'help',
        },
    }),
);

export interface InfoPopUpProps {
    text: string;
    title?: string;
    variant: Variant;
    content: ReactNode;
}

export const InfoPopUp = (props: InfoPopUpProps) => {

    const { text, title, variant, content } = props;
    const classes = useStyles();

    const typographyProps = useMemo(() => ({
        className: classes.subtitle,
        variant,
        component: 'span' as const,
    }), [classes.subtitle, variant]);

    const iconProps = useMemo(() => ({
        className: classes.icon,
        'aria-label': 'More information',
        fontSize: 'inherit' as const,
    }), [classes.icon]);

    const popoverProps = useMemo(() => ({
        title,
        content,
    }), [title, content]);

    return (
        <Box className={classes.container}>
            <Typography {...typographyProps}>
                {text}
            </Typography>
            <InfoPopOver {...popoverProps}>
                <InfoOutlinedIcon {...iconProps} />
            </InfoPopOver>
        </Box>
    );
}