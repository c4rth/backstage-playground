import { AzureDevOpsIcon } from '@internal/plugin-api-platform-react';
import { RiPuzzleFill, RiShapesFill, RiCpuLine, RiGlobalLine, RiBookShelfLine } from '@remixicon/react'
import { Flex } from '@backstage/ui';

export type CatalogReactEntityDisplayNameClassKey = 'root' | 'icon';

export type ComponentDisplayNameProps = {
    text: string;
    type: 'api' | 'system' | 'service' | 'azdo' | 'url' | 'library';
};

const ICON_STYLE: React.CSSProperties = {
  marginRight: '0.25rem',
  color: 'var(--bui-fg-secondary)',
  fontSize: 'inherit',
};

export const ComponentDisplayName = ({ text, type }: ComponentDisplayNameProps): React.JSX.Element => {
    return (
        <Flex gap='xs' style={{ alignItems: 'center', textDecoration: 'inherit', color: 'inherit' }}>
            {type === 'api' && (
                <RiPuzzleFill style={ICON_STYLE} size='16px'/>
            )}
            {type === 'system' && (
                <RiShapesFill style={ICON_STYLE} size='16px'/>
            )}
            {type === 'service' && (
                <RiCpuLine style={ICON_STYLE}  size='16px'/>
            )}
            {type === 'azdo' && (
                <AzureDevOpsIcon style={ICON_STYLE} size='16px'/>
            )}
            {type === 'url' && (
                <RiGlobalLine style={ICON_STYLE}  size='16px'/>
            )}
            {type === 'library' && (
                <RiBookShelfLine style={ICON_STYLE}  size='16px'/>
            )}
            {text}
        </Flex>
    );
};