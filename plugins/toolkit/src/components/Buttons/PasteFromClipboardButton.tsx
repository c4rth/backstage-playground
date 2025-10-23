import { RiClipboardFill } from '@remixicon/react';
import { Button, TooltipTrigger, Tooltip} from '@backstage/ui';

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
    <TooltipTrigger>
      <Button
        iconStart={<RiClipboardFill />}
        onClick={pasteFromClipboard}
        variant='tertiary'
      >
        Clipboard
      </Button>
      <Tooltip placement='bottom'>{props.title ?? 'Paste input from clipboard'}</Tooltip>
    </TooltipTrigger>
  );
};