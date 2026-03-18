import { HealthProbe } from "../../types";
import { RiCircleFill } from "@remixicon/react";
import { Link } from "react-router-dom";
import { ButtonIcon, TooltipTrigger, Cell, Tooltip, ButtonLink, Box } from "@backstage/ui";

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
        <Cell style={{ paddingLeft: 'var(--bui-font-size-2)' }}>
            <TooltipTrigger delay={500}>
                <ButtonLink variant="tertiary"
                    href={healthProbe.healthUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: bulletColor }}>
                    <Box bg="success" style={{ borderRadius: '50%', width: '1.5em', height: '1.5em' }} />
                </ButtonLink>
                <Tooltip placement='bottom' style={{ maxWidth: '50em' }}>
                    {JSON.stringify(healthProbe.status)}
                </Tooltip>
            </TooltipTrigger>
        </Cell>
    );
};

/*

            <TooltipTrigger delay={500}>
                <ButtonLink variant="tertiary"
                    href={healthProbe.healthUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ margin: 0, padding: 0, textDecoration: 'none' }} >
                    <RiCircleFill style={{ color: bulletColor }} size="30"/>
                </ButtonLink>
                <Tooltip placement='bottom' style={{ maxWidth: '50em' }}>
                    {JSON.stringify(healthProbe.status)}
                </Tooltip>
            </TooltipTrigger>
*/