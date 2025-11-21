import { CopyTextButton, MarkdownContent } from "@backstage/core-components";
import { AboutField } from "@backstage/plugin-catalog";
import { Card, CardBody, CardHeader, Grid, Text } from "@backstage/ui";
import { makeStyles, Theme } from "@material-ui/core";
import { useMemo, memo } from 'react';
import { Divider } from "@internal/plugin-api-platform-react";

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

const FieldDisplay = memo<{
    label: string;
    value: string | undefined;
    className: string;
    showCopyButton?: boolean;
}>(({ label, value, className, showCopyButton = false }) => (
    <Grid.Item>
        <AboutField label={label}>
            <Text variant="body-medium" className={className} style={{ display: 'inline' }}>
                {value || '-'}
            </Text>
            {showCopyButton && value && <CopyTextButton text={value} />}
        </AboutField>
    </Grid.Item>
));

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

export const McaOperationAboutCard = memo<McaOperationAboutCardProps>(({ operationAnalyze, operation }) => {
    const classes = useStyles();

    const fieldValues = useMemo(() => ({
        package: operationAnalyze?.package,
        type: operationAnalyze?.type,
        version: operationAnalyze?.version,
        cobolName: operationAnalyze?.cobolName,
        flowControllerName: operationAnalyze?.flowControlerName,
        bsName: operationAnalyze?.bsName,
        bfunction: operationAnalyze?.bfunction,
        ficLocation: getDecodedURI(operationAnalyze?.ficLocation),
        ticLocation: getDecodedURI(operationAnalyze?.ticLocation),
        cicLocation: getDecodedURI(operationAnalyze?.cicLocation),
        useCache: operation?.useCache ? 'TRUE' : 'FALSE',
        description: operationAnalyze?.description,
    }), [operationAnalyze, operation]);

    const fieldConfigs = useMemo(() => [
        { label: "Package", value: fieldValues.package, xs: 6 },
        { label: "Extends", value: fieldValues.type, xs: 6 },
        { label: "Operation Version", value: fieldValues.version, xs: 6 },
        { label: "Operation Type", value: fieldValues.cobolName, xs: 6 },
        { label: "Flow Controller", value: fieldValues.flowControllerName, xs: 6 },
        { label: "BS", value: fieldValues.bsName, xs: 6 },
        { label: "B-Function", value: fieldValues.bfunction, xs: 12 },
        {
            label: "FIC",
            value: fieldValues.ficLocation,
            xs: 12,
            showCopyButton: Boolean(operationAnalyze?.ficLocation)
        },
        {
            label: "TIC",
            value: fieldValues.ticLocation,
            xs: 12,
            showCopyButton: Boolean(operationAnalyze?.ticLocation)
        },
        {
            label: "CIC",
            value: fieldValues.cicLocation,
            xs: 12,
            showCopyButton: Boolean(operationAnalyze?.cicLocation)
        },
        { label: "Caching", value: fieldValues.useCache, xs: 12 },
    ], [fieldValues, operationAnalyze]);

    return (
        <Card className={classes.gridItemCard}>
            <CardHeader style={{ margin: '0.5rem' }}><Text variant='title-small'><b>About</b></Text></CardHeader>
            <Divider />
            <CardBody className={classes.gridItemCardContent} style={{ margin: '0.5rem' }}>
                <Grid.Root columns='1'>
                    {fieldConfigs.map((config) => (
                        <FieldDisplay
                            key={config.label}
                            label={config.label}
                            value={config.value}
                            className={classes.value}
                            showCopyButton={config.showCopyButton}
                        />
                    ))}
                    <Grid.Item>
                        <AboutField label="Description">
                            <MarkdownContent content={fieldValues.description || ''} />
                        </AboutField>
                    </Grid.Item>
                </Grid.Root>
            </CardBody>
        </Card>
    );
});