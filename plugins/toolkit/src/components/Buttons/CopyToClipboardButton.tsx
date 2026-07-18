import { useApi } from '@backstage/core-plugin-api';
import { RiClipboardLine } from '@remixicon/react';
import { Button, TooltipTrigger, Tooltip } from '@backstage/ui';
import { toastApiRef } from '@backstage/frontend-plugin-api';

type Props = {
  output: string | number;
  title?: string;
};

export const CopyToClipboardButton = (props: Props) => {
  const toastApi = useApi(toastApiRef);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(props.output.toString())
      .then(() => {
        toastApi.post({
          title: 'Copied to clipboard!',
          status: 'success',
          timeout: 2000,
        });
      })
      .catch(() => {
        toastApi.post({
          title: 'Failed to copy to clipboard!',
          status: 'warning',
          timeout: 2000,
        });
      });
  };

  return (
    <TooltipTrigger>
      <Button
        size="small"
        iconStart={<RiClipboardLine />}
        onClick={copyToClipboard}
        variant="tertiary"
      >
        Copy
      </Button>
      <Tooltip placement="bottom">{props.title || 'Copy to clipboard'}</Tooltip>
    </TooltipTrigger>
  );
};
