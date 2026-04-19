import { RiCloseCircleLine } from '@remixicon/react';
import { Button, TooltipTrigger, Tooltip } from '@backstage/ui';

type Props = {
  setValue: (input: string) => void;
  defaultValue?: string;
  tooltip?: string;
};

export const ClearValueButton = (props: Props) => {
  return (
    <TooltipTrigger>
      <Button
        size="medium"
        iconStart={<RiCloseCircleLine />}
        onClick={() => props.setValue(props.defaultValue || '')}
        variant="tertiary"
      >
        Clear
      </Button>
      <Tooltip placement="bottom">
        {props.tooltip || 'Clear the current value'}
      </Tooltip>
    </TooltipTrigger>
  );
};
