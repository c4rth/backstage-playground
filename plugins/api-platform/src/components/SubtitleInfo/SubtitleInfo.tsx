import React, { ReactNode } from 'react';
import { Box, makeStyles, Typography } from '@material-ui/core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { Variant } from '@material-ui/core/styles/createTypography';
import { InfoPopover } from '@internal/plugin-api-platform-react';


const useStyles = makeStyles(
    theme => ({
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
        },
    }),
);

export interface InfoPopUpProps {
    text: string;
    variant: Variant;
    content: ReactNode;
}

export const InfoPopUp = (props: InfoPopUpProps) => {

    const { text, variant, content } = props;
    const classes = useStyles();

    return (
        <Box display="flex" alignItems="center">
            <Typography className={classes.subtitle} variant={variant}>{text} </Typography>
            <InfoPopover title={text}
                content={content}>
                <InfoOutlinedIcon className={classes.icon} />
            </InfoPopover>
        </Box>
    );
};