import { HealthProbe } from "../../types";
import { TooltipTrigger, Cell, Tooltip, ButtonLink, Box } from "@backstage/ui";


const StatusTable = ({ status }: {
    status: {
        errorMessage?: string;
        [key: string]: any;
    };
}) => (
    <table>
        <tbody>
            {Object.entries(status).map(([key, value]) => (
                <tr>
                    <td style={{ paddingRight: '8px' }}><b>{key}</b></td>
                    <td>{value}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

const getBulletColor = (status: number): string => {
    if (status === 200) {
        return 'green';
    }
    if (status === 202) {
        return 'blue';
    }
    return 'red';
};

const getHealthUrl = (probeUrl: string | undefined): string => {
    if (!probeUrl) {
        return '';
    }
    if (probeUrl.startsWith('http')) {
        return probeUrl;
    }
    return `https://${probeUrl}`;
}

export const HealthProbeCell = ({
    healthProbe,
}: {
    healthProbe: HealthProbe | undefined;
}) => {

    if (!healthProbe || !healthProbe.returnedHttpStatus) {
        return (
            <Cell>
                <Box style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>-</Box>
            </Cell>
        );
    }

    const bulletColor = getBulletColor(healthProbe.returnedHttpStatus);

    return (
        <Cell>
            <Box style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <TooltipTrigger delay={500}>
                    <ButtonLink variant="tertiary"
                        href={getHealthUrl(healthProbe.healthUrl)}
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