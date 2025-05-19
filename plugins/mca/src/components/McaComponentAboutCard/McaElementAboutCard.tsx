import { MarkdownContent } from "@backstage/core-components";
import { AboutField } from "@backstage/plugin-catalog";
import { Card, CardContent, CardHeader, Divider, Grid, makeStyles, Theme, Typography } from "@material-ui/core";

export interface McaElementAboutCardProps {    
    element: any;
}

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

export const McaElementAboutCard = (props: McaElementAboutCardProps) => {
    const { element } = props;

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
                        gridSizes={{ xs: 12, sm: 6, lg: 6 }} >
                        <div>
                            <Typography variant='body2' display='inline' className={classes.value}>{element.package}</Typography>
                        </div>
                    </AboutField>
                    <AboutField
                        label="Extends"
                        gridSizes={{ xs: 12, sm: 6, lg: 6 }} >
                        <div>
                            <Typography variant='body2' display='inline' className={classes.value}>{element.superClass}</Typography>
                        </div>
                    </AboutField>
                    <Divider />
                    <AboutField
                        label="Description"
                        gridSizes={{ xs: 12, sm: 6, lg: 12 }} >
                            <MarkdownContent content={element.description} />
                    </AboutField>
                </Grid>
            </CardContent>
        </Card>
    );
}