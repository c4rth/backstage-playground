import { ReactNode } from 'react';
import { RiInformationLine } from '@remixicon/react';
import {
  Box,
  Flex,
  Text,
  TextVariants,
  DialogTrigger,
  ButtonIcon,
  Popover,
} from '@backstage/ui';

export interface InformationPopupProps {
  text?: string;
  title?: string;
  variant?: TextVariants;
  content: ReactNode;
}

const INFORMATION_POPOVER_STYLE = {
  width: 'min(40rem, calc(100vw - var(--bui-space-8)))',
  maxWidth: '50em',
};

export const InformationPopup = (props: InformationPopupProps) => {
  const { text, variant = 'body-medium', content } = props;

  return (
    <Flex align="center">
      {text && (
        <Box as="span" mr="1">
          <Text variant={variant} style={{ color: 'var(--bui-accent-fg)' }}>
            {text}
          </Text>
        </Box>
      )}
      <DialogTrigger>
        <ButtonIcon
          variant="secondary"
          icon={
            <RiInformationLine
              aria-label="More information"
              fontSize="inherit"
            />
          }
        />
        <Popover
          placement="bottom end"
          style={INFORMATION_POPOVER_STYLE}
        >
          {content}
        </Popover>
      </DialogTrigger>
    </Flex>
  );
};

export interface InformationPopupContentProps {
  text1: string;
  text2?: string;
}

export const InformationPopupContent = (
  props: InformationPopupContentProps,
) => {
  const { text1, text2 } = props;
  return (
    <Box style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
      <Text variant="body-large">{text1}</Text>
      {text2 && (
        <>
          <br />
          <Box mt="1">
            <Text variant="body-medium">
              <i>{text2}</i>
            </Text>
          </Box>
        </>
      )}
    </Box>
  );
};
