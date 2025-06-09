import { Button, Tooltip } from '@material-ui/core';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import FileCopy from '@material-ui/icons/FileCopy';

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
    <Tooltip
      arrow
      title={props.title ?? 'Copy output to clipboard'}
    >
      <Button
        size="small"
        startIcon={<FileCopy />}
        onClick={copyToClipboard}
        variant="text"
        color="inherit"
      >
        Copy
      </Button>
    </Tooltip>
  );
};