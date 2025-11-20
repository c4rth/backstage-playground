import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { RiClipboardLine } from '@remixicon/react';
import { Button, TooltipTrigger, Tooltip} from '@backstage/ui';

type Props = {
  output: string | number;
  title?: string;
};

export const CopyToClipboardButton = (props: Props) => {
  const alertApi = useApi(alertApiRef);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(props.output.toString())
      .then(() => {
        alertApi.post({ message: 'Copied to clipboard!', severity: 'success' });
      })
      .catch(() => {
        alertApi.post({
          message: 'Failed to copy to clipboard!',
          severity: 'error',
        });
      });
  };

  return (
    <TooltipTrigger>
      <Button
        size='medium'
        iconStart={<RiClipboardLine />}
        onClick={copyToClipboard}
        variant='tertiary'
      >
        Copy
      </Button>
      <Tooltip placement='bottom'>{props.title || 'Copy to clipboard'}</Tooltip>
    </TooltipTrigger>
  );
};