
import { Button, Tooltip } from '@material-ui/core';
import Clear from '@material-ui/icons/Clear';

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
        startIcon={<Clear />}
        onClick={() => props.setValue('')}
        variant="text"
        color="inherit"
      >
        Clear
      </Button>
    </Tooltip>
  );
};