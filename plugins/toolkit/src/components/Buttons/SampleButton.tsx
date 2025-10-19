import { Button, Tooltip } from '@material-ui/core';
import { RiEditBoxLine } from '@remixicon/react';

type Props = {
  sample: string;
  setInput: (input: string) => void;
};

export const SampleButton = (props: Props) => {
  return (
    <Tooltip arrow title='Input sample'>
      <Button
        size="small"
        startIcon={<RiEditBoxLine />}
        onClick={() => props.setInput(props.sample)}
        variant="text"
        color="inherit"
      >
        Sample
      </Button>
    </Tooltip>
  );
};