import { RiClipboardFill } from '@remixicon/react';
import { Button, TooltipTrigger, Tooltip } from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { toolkitTranslationRef } from '../../translation';

type Props = {
  setInput: (input: string) => void;
  title?: string;
};

export const PasteFromClipboardButton = (props: Props) => {
  const { t } = useTranslationRef(toolkitTranslationRef);
  const pasteFromClipboard = () => {
    navigator.clipboard.readText().then(
      text => props.setInput(text),
      // TODO: handle error
    );
  };

  return (
    <TooltipTrigger>
      <Button
        size="small"
        iconStart={<RiClipboardFill />}
        onClick={pasteFromClipboard}
        variant="tertiary"
      >
        {t('buttons.paste')}
      </Button>
      <Tooltip placement="bottom">
        {props.title ?? t('buttons.pasteTooltip')}
      </Tooltip>
    </TooltipTrigger>
  );
};
