import { RiEditBoxLine } from '@remixicon/react';
import { Button, TooltipTrigger, Tooltip } from '@backstage/ui';

type Props = {
  sample: string;
  setInput: (input: string) => void;
};

export const SampleButton = (props: Props) => {
  return (
    <TooltipTrigger>
      <Button
        size="medium"
        iconStart={<RiEditBoxLine />}
        onClick={() => props.setInput(props.sample)}
        variant="tertiary"
      >
        Sample
      </Button>
      <Tooltip placement="bottom">Copy sample to input</Tooltip>
    </TooltipTrigger>
  );
};
