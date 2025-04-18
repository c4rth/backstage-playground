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
                    <AboutField
                        label="Package"
                        gridSizes={{ xs: 12, sm: 6, lg: 4 }} >
                        <div>
                            <Typography variant='body2' display='inline' className={classes.value}>{operationAnalyze.package}</Typography>
                        </div>
                    </AboutField>
                    <AboutField
                        label="Extends"
                        gridSizes={{ xs: 12, sm: 6, lg: 4 }} >
                        <div>
                            <Typography variant='body2' display='inline' className={classes.value}>{operationAnalyze.type}</Typography>
                        </div>
                    </AboutField>
                    <AboutField
                        label="Operation Version"
                        gridSizes={{ xs: 12, sm: 6, lg: 4 }} >
                        <div>
                            <Typography variant='body2' display='inline' className={classes.value}>{operationAnalyze.version}</Typography>
                        </div>
                    </AboutField>
                    <AboutField
                        label="Operation Type"
                        gridSizes={{ xs: 12, sm: 6, lg: 4 }} >
                        <div>
                            <Typography variant='body2' display='inline' className={classes.value}>{operationAnalyze.cobolName}</Typography>
                        </div>
                    </AboutField>
                    <AboutField
                        label="Flow Controller"
                        gridSizes={{ xs: 12, sm: 6, lg: 4 }} >
                        <div>
                            <Typography variant='body2' display='inline' className={classes.value}>{operationAnalyze.flowControlerName}</Typography>
                        </div>
                    </AboutField>
                    <AboutField
                        label="BS"
                        gridSizes={{ xs: 12, sm: 6, lg: 4 }} >
                        <div>
                            <Typography variant='body2' display='inline' className={classes.value}>{operationAnalyze.bsName}</Typography>
                        </div>
                    </AboutField>
                    <AboutField
                        label="FIC"
                        gridSizes={{ xs: 12, sm: 6, lg: 12 }} >
                        <div>
                            <Typography variant='body2' display='inline' className={classes.value}>{getDecodedURI(operationAnalyze.ficLocation)}</Typography>
                            {operationAnalyze.ficLocation && <CopyTextButton text={getDecodedURI(operationAnalyze.ficLocation)} />}
                        </div>
                    </AboutField>
                    <AboutField
                        label="TIC"
                        gridSizes={{ xs: 12, sm: 6, lg: 12 }} >
                        <div>
                            <Typography variant='body2' display='inline' className={classes.value}>{getDecodedURI(operationAnalyze.ticLocation)}</Typography>
                            {operationAnalyze.ticLocation && <CopyTextButton text={getDecodedURI(operationAnalyze.ticLocation)} />}
                        </div>
                    </AboutField>
                    <AboutField
                        label="CIC"
                        gridSizes={{ xs: 12, sm: 6, lg: 12 }} >
                        <div>
                            <Typography variant='body2' display='inline' className={classes.value}>{getDecodedURI(operationAnalyze.cicLocation)}</Typography>
                            {operationAnalyze.cicLocation && <CopyTextButton text={getDecodedURI(operationAnalyze.cicLocation)} />}
                        </div>
                    </AboutField>
                    <AboutField
                        label="Caching"
                        gridSizes={{ xs: 12, sm: 6, lg: 12 }} >
                        <div>
                            <Typography variant='body2' display='inline' className={classes.value}>{operation.useCache ? 'TRUE' : 'FALSE'}</Typography>
                        </div>
                    </AboutField>
                    <Divider />
                    <AboutField
                        label="Description"
                        gridSizes={{ xs: 12, sm: 6, lg: 12 }} >
                            <MarkdownContent content={operationAnalyze.description} />
                    </AboutField>
                </Grid>
            </CardContent>
        </Card>
    );
}