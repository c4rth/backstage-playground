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

export const IconInformationPopup = (props: InformationPopupProps) => {
  const { title, content } = props;

  return (
    <DialogTrigger>
      <ButtonIcon
        variant="tertiary"
        size="medium"
        style={{ width: 'auto', background: 'transparent' }}
        icon={<RiInformationLine aria-label="More information" />}
      />
      <Popover placement="bottom" style={{ maxWidth: '50em' }}>
        <Text variant="title-x-small">
          <b>{title}</b>
        </Text>
        {content}
      </Popover>
    </DialogTrigger>
  );
};

export const InformationPopup = (props: InformationPopupProps) => {
  const { text, title, variant = 'body-medium', content } = props;

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
        <Popover placement="bottom" style={{ maxWidth: '50em' }}>
          <Text variant="title-x-small">
            <b>{title}</b>
          </Text>
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
    <Box>
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
