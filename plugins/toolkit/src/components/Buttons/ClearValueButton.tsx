
import { Button, Tooltip } from '@material-ui/core';
import { RiCloseCircleLine } from '@remixicon/react';

type Props = {
  setValue: (input: string) => void;
  tooltip?: string;
};

export const ClearValueButton = (props: Props) => {
  return (
    <Tooltip
      arrow
      title={props.tooltip ?? 'Clear input value'}
    >
      <Button
        size="small"
        startIcon={<RiCloseCircleLine />}
        onClick={() => props.setValue('')}
        variant="text"
        color="inherit"
      >
        Clear
      </Button>
    </Tooltip>
  );
};