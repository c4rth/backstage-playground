import { useApi } from '@backstage/core-plugin-api';
import { RiClipboardLine } from '@remixicon/react';
import { Button, TooltipTrigger, Tooltip } from '@backstage/ui';
import { toastApiRef, useTranslationRef } from '@backstage/frontend-plugin-api';
import { toolkitTranslationRef } from '../../translation';

type Props = {
  output: string | number;
  title?: string;
};

export const CopyToClipboardButton = (props: Props) => {
  const { t } = useTranslationRef(toolkitTranslationRef);
  const toastApi = useApi(toastApiRef);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(props.output.toString())
      .then(() => {
        toastApi.post({
          title: t('buttons.copySuccess'),
          status: 'success',
          timeout: 2000,
        });
      })
      .catch(() => {
        toastApi.post({
          title: t('buttons.copyError'),
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
        {t('buttons.copy')}
      </Button>
      <Tooltip placement="bottom">
        {props.title || t('buttons.copyTooltip')}
      </Tooltip>
    </TooltipTrigger>
  );
};
