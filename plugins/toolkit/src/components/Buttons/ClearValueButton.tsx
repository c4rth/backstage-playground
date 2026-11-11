import { RiCloseCircleLine } from '@remixicon/react';
import { Button, TooltipTrigger, Tooltip } from '@backstage/ui';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { toolkitTranslationRef } from '../../translation';

type Props = {
  setValue: (input: string) => void;
  defaultValue?: string;
  tooltip?: string;
};

export const ClearValueButton = (props: Props) => {
  const { t } = useTranslationRef(toolkitTranslationRef);
  return (
    <TooltipTrigger>
      <Button
        size="small"
        iconStart={<RiCloseCircleLine />}
        onClick={() => props.setValue(props.defaultValue || '')}
        variant="tertiary"
      >
        {t('buttons.clear')}
      </Button>
      <Tooltip placement="bottom">
        {props.tooltip || t('buttons.clearTooltip')}
      </Tooltip>
    </TooltipTrigger>
  );
};
