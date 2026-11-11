import { RiEditBoxLine } from '@remixicon/react';
import { Button, TooltipTrigger, Tooltip } from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { toolkitTranslationRef } from '../../translation';

type Props = {
  sample: string;
  setInput: (input: string) => void;
};

export const SampleButton = (props: Props) => {
  const { t } = useTranslationRef(toolkitTranslationRef);
  return (
    <TooltipTrigger>
      <Button
        size="small"
        iconStart={<RiEditBoxLine />}
        onClick={() => props.setInput(props.sample)}
        variant="tertiary"
      >
        {t('buttons.sample')}
      </Button>
      <Tooltip placement="bottom">{t('buttons.sampleTooltip')}</Tooltip>
    </TooltipTrigger>
  );
};
