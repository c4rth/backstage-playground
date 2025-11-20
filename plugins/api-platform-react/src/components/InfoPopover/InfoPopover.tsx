import { PropsWithChildren, ReactElement, ReactNode } from 'react';
import { ButtonIcon, Text, Tooltip, TooltipTrigger } from '@backstage/ui';

export type InfoPopoverProps = PropsWithChildren<{
  title?: string;
  variant?: string;
  delayTime?: number;
  content?: ReactNode;
}>;

export const InfoPopOver = (props: InfoPopoverProps) => {

  const { children, delayTime = 250, title, content } = props;

  return (
    <TooltipTrigger delay={delayTime}>
      <ButtonIcon size='medium' style={{ width: 'auto', background: 'transparent'}} icon={children as ReactElement} />
      <Tooltip placement='bottom' style={{ maxWidth: '50em'}}>
          {title && <Text variant='title-x-small'><b>{title}</b></Text>}
          {content && <Text>{content}</Text>}
      </Tooltip>
    </TooltipTrigger>
  );


}