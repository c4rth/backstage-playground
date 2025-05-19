import { CopyTextButton, MarkdownContent } from "@backstage/core-components";
import { AboutField } from "@backstage/plugin-catalog";
import { Card, CardContent, CardHeader, Divider, Grid, makeStyles, Theme, Typography } from "@material-ui/core";

const useStyles = makeStyles(
    (theme: Theme) => ({
        gridItemCard: {
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100% - 10px)', // for pages without content header
            marginBottom: '10px',
        },
        infoCardHeader: {
            padding: '16px',
        },
        gridItemCardContent: {
            flex: 1,
        },
        value: {
            fontWeight: 'bold',
            overflow: 'hidden',
            lineHeight: '24px',
            wordBreak: 'break-word',
        },
        label: {
            color: theme.palette.text.secondary,
            textTransform: 'uppercase',
            fontSize: '10px',
            fontWeight: 'bold',
            letterSpacing: 0.5,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
        },
    }),
);

function getDecodedURI(url: string | undefined): string {
    if (!url) {
        return '-';
    }
    return url;
}

export interface McaOperationAboutCardProps {
    operationAnalyze: any;
    operation: any;
}

export const McaOperationAboutCard = (props: McaOperationAboutCardProps) => {
    const { operationAnalyze, operation } = props;
    const classes = useStyles();

    return (
        <Card className={classes.gridItemCard}>
            <CardHeader
                title='About'
            />
            <Divider />
            <CardContent className={classes.gridItemCardContent}>
                <Grid container>
                    <Grid item xs={6}>
                        <AboutField
                            label="Package">
                            <div>
                                <Typography variant='body2' display='inline' className={classes.value}>{operationAnalyze.package}</Typography>
                            </div>
                        </AboutField>
                    </Grid>
                    <Grid item xs={6}>
                        <AboutField
                            label="Extends">
                            <div>
                                <Typography variant='body2' display='inline' className={classes.value}>{operationAnalyze.type}</Typography>
                            </div>
                        </AboutField>
                    </Grid>
                    <Grid item xs={6}>
                        <AboutField
                            label="Operation Version" >
                            <div>
                                <Typography variant='body2' display='inline' className={classes.value}>{operationAnalyze.version}</Typography>
                            </div>
                        </AboutField>
                    </Grid>
                    <Grid item xs={6}>
                        <AboutField
                            label="Operation Type">
                            <div>
                                <Typography variant='body2' display='inline' className={classes.value}>{operationAnalyze.cobolName}</Typography>
                            </div>
                        </AboutField>
                    </Grid>
                    <Grid item xs={6}>
                        <AboutField
                            label="Flow Controller">
                            <div>
                                <Typography variant='body2' display='inline' className={classes.value}>{operationAnalyze.flowControlerName}</Typography>
                            </div>
                        </AboutField>
                    </Grid>
                    <Grid item xs={6}>
                        <AboutField
                            label="BS">
                            <div>
                                <Typography variant='body2' display='inline' className={classes.value}>{operationAnalyze.bsName}</Typography>
                            </div>
                        </AboutField>
                    </Grid>
                    <Grid item xs={12}>
                        <AboutField
                            label="B-Function">
                            <div>
                                <Typography variant='body2' display='inline' className={classes.value}>{operationAnalyze.bfunction}</Typography>
                            </div>
                        </AboutField>
                    </Grid>
                    <Grid item xs={12}>
                        <AboutField
                            label="FIC">
                            <div>
                                <Typography variant='body2' display='inline' className={classes.value}>{getDecodedURI(operationAnalyze.ficLocation)}</Typography>
                                {operationAnalyze.ficLocation && <CopyTextButton text={getDecodedURI(operationAnalyze.ficLocation)} />}
                            </div>
                        </AboutField>
                    </Grid>
                    <Grid item xs={12}>
                        <AboutField
                            label="TIC">
                            <div>
                                <Typography variant='body2' display='inline' className={classes.value}>{getDecodedURI(operationAnalyze.ticLocation)}</Typography>
                                {operationAnalyze.ticLocation && <CopyTextButton text={getDecodedURI(operationAnalyze.ticLocation)} />}
                            </div>
                        </AboutField>
                    </Grid>
                    <Grid item xs={12}>
                        <AboutField
                            label="CIC">
                            <div>
                                <Typography variant='body2' display='inline' className={classes.value}>{getDecodedURI(operationAnalyze.cicLocation)}</Typography>
                                {operationAnalyze.cicLocation && <CopyTextButton text={getDecodedURI(operationAnalyze.cicLocation)} />}
                            </div>
                        </AboutField>
                    </Grid>
                    <Grid item xs={12}>
                        <AboutField
                            label="Caching">
                            <div>
                                <Typography variant='body2' display='inline' className={classes.value}>{operation.useCache ? 'TRUE' : 'FALSE'}</Typography>
                            </div>
                        </AboutField>
                    </Grid>
                    <Grid item xs={12}>
                        <AboutField
                            label="Description">
                            <MarkdownContent content={operationAnalyze.description} />
                        </AboutField>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}