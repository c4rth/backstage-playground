import { Button, Tooltip } from '@material-ui/core';
import { RiClipboardFill } from '@remixicon/react';

type Props = {
  setInput: (input: string) => void;
  title?: string;
};

export const PasteFromClipboardButton = (props: Props) => {
  const pasteFromClipboard = () => {
    navigator.clipboard.readText().then(
      text => props.setInput(text),
      // TODO: handle error
    );
  };
  return (
    <Tooltip
      arrow
      title={
        props.title ?? 'Paste input from clipboard'
      }
    >
      <Button
        size="small"
        startIcon={<RiClipboardFill />}
        onClick={pasteFromClipboard}
        variant="text"
        color="inherit"
      >
        Clipboard
      </Button>
    </Tooltip>
  );
};