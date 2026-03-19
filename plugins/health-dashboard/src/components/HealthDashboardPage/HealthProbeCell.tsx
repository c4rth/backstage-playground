import { HealthProbe } from "../../types";
import { TooltipTrigger, Cell, Tooltip, ButtonLink, Box, Grid } from "@backstage/ui";


const StatusTable = ({ status }: {
    status: {
        errorMessage?: string;
        [key: string]: any;
    };
}) => (
    <Grid.Root columns='2' mt="var(--bui-space-3)" mb="var(--bui-space-3)">
        {Object.entries(status).map(([key, value]) => (
            <>
                <Grid.Item><b>{key}</b></Grid.Item>
                <Grid.Item>{value}</Grid.Item>
            </>
        ))}
    </Grid.Root>
);

export const HealthProbeCell = ({
    healthProbe,
}: {
    healthProbe: HealthProbe | undefined;
}) => {

    if (!healthProbe || !healthProbe.returnedHttpStatus) {
        return <Cell />;
    }

    const bulletColor = healthProbe.returnedHttpStatus === 200 ? 'green' : healthProbe.returnedHttpStatus === 202 ? 'blue' : 'red';

    return (
        <Cell>
            <Box style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <TooltipTrigger delay={500}>
                    <ButtonLink variant="tertiary"
                        href={healthProbe.healthUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: bulletColor }}>
                        <Box style={{ borderRadius: '50%', width: '1.5em', height: '1.5em', backgroundColor: bulletColor }}><></></Box>
                    </ButtonLink>
                    <Tooltip placement='bottom' style={{ maxWidth: '50em' }}>
                        <StatusTable status={healthProbe.status} />
                    </Tooltip>
                </TooltipTrigger>
            </Box>
        </Cell>
    );
};