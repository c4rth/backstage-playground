import { AzureDevOpsIcon } from '@internal/plugin-api-platform-react';
import {
  RiPuzzleFill,
  RiShapesFill,
  RiCpuLine,
  RiGlobalLine,
  RiBookShelfLine,
} from '@remixicon/react';
import { Flex, Box } from '@backstage/ui';

export type CatalogReactEntityDisplayNameClassKey = 'root' | 'icon';

export type ComponentDisplayNameProps = {
  text: string;
  type: 'api' | 'system' | 'service' | 'azdo' | 'url' | 'library';
};

const ICON_STYLE: React.CSSProperties = {
  marginRight: '0.25em',
  color: 'var(--bui-fg-secondary)',
  fontSize: '16px',
  width: '16px',
  height: '16px',
  display: 'block',
};

const ICON_WRAPPER_STYLE: React.CSSProperties = {
  width: '16px',
  height: '16px',
  minWidth: '16px',
  minHeight: '16px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 16px',
};

export const ComponentDisplayName = ({
  text,
  type,
}: ComponentDisplayNameProps): React.JSX.Element => {
  return (
    <Flex
      gap="xs"
      style={{
        alignItems: 'center',
        textDecoration: 'inherit',
        color: 'inherit',
      }}
    >
      {type === 'api' && (
        <Box style={ICON_WRAPPER_STYLE}>
          <RiPuzzleFill style={ICON_STYLE} />
        </Box>
      )}
      {type === 'system' && (
        <Box style={ICON_WRAPPER_STYLE}>
          <RiShapesFill style={ICON_STYLE} />
        </Box>
      )}
      {type === 'service' && (
        <Box style={ICON_WRAPPER_STYLE}>
          <RiCpuLine style={ICON_STYLE} />
        </Box>
      )}
      {type === 'azdo' && (
        <Box style={ICON_WRAPPER_STYLE}>
          <AzureDevOpsIcon style={ICON_STYLE} />
        </Box>
      )}
      {type === 'url' && (
        <Box style={ICON_WRAPPER_STYLE}>
          <RiGlobalLine style={ICON_STYLE} />
        </Box>
      )}
      {type === 'library' && (
        <Box style={ICON_WRAPPER_STYLE}>
          <RiBookShelfLine style={ICON_STYLE} />
        </Box>
      )}
      {text}
    </Flex>
  );
};
