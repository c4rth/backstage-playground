import { memo } from 'react';
import { HealthProbe } from "../../types";
import { TooltipTrigger, Cell, Tooltip, ButtonLink, Box } from "@backstage/ui";

const cellStyle = { paddingRight: '8px' } as const;
const centerStyle = { width: '100%', display: 'flex', justifyContent: 'center' } as const;
const tooltipStyle = { maxWidth: '50em' } as const;
const bulletStyle = (color: string) => ({
    borderRadius: '50%',
    width: '1.5em',
    height: '1.5em',
    backgroundColor: color,
} as const);

const StatusTable = memo(({ status }: {
    status: {
        errorMessage?: string;
        [key: string]: any;
    };
}) => (
    <table>
        <tbody>
            {Object.entries(status).map(([key, value]) => (
                <tr key={key}>
                    <td style={cellStyle}><b>{key}</b></td>
                    <td>{value}</td>
                </tr>
            ))}
        </tbody>
    </table>
));

const STATUS_COLORS: Record<number, string> = { 200: 'green', 202: 'blue' };
const getBulletColor = (status: number): string => STATUS_COLORS[status] ?? 'red';

const getHealthUrl = (probeUrl: string | undefined): string => {
    if (!probeUrl) {
        return '';
    }
    if (probeUrl.startsWith('http')) {
        return probeUrl;
    }
    return `https://${probeUrl}`;
}

export const HealthProbeCell = memo(({
    healthProbe,
}: {
    healthProbe: HealthProbe | undefined;
}) => {
    if (!healthProbe || !healthProbe.returnedHttpStatus) {
        return (
            <Cell>
                <Box style={centerStyle}>-</Box>
            </Cell>
        );
    }

    const bulletColor = getBulletColor(healthProbe.returnedHttpStatus);

    return (
        <Cell>
            <Box style={centerStyle}>
                <TooltipTrigger delay={500}>
                    <ButtonLink variant="tertiary"
                        href={getHealthUrl(healthProbe.healthUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: bulletColor }}>
                        <Box style={bulletStyle(bulletColor)}><></></Box>
                    </ButtonLink>
                    <Tooltip placement='bottom' style={tooltipStyle}>
                        <StatusTable status={healthProbe.status} />
                    </Tooltip>
                </TooltipTrigger>
            </Box>
        </Cell>
    );
});