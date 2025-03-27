import React from 'react';
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
}

export const InfoPopUp = (props: InfoPopUpProps) => {

    const text = props.text;
    const classes = useStyles();

    return (
        <Box display="flex" alignItems="center">
            <Typography className={classes.subtitle} variant={props.variant}>{text} </Typography>
            <InfoPopover title={text}
                content={
                    <>
                        <Typography variant="body2">This is a description of the {text}.</Typography>
                        <Typography variant="body2">This is a description of the {text}.</Typography>
                        <Typography variant="body2">This is a description of the {text}.</Typography>
                        <Typography variant="body2">This is a description of the {text}.</Typography>
                    </>}>
                <InfoOutlinedIcon className={classes.icon} />
            </InfoPopover>
        </Box>
    );
};