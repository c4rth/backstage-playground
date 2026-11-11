import { useState, useEffect } from 'react';
import { DefaultEditor } from '../DefaultEditor';
import cronstrue from 'cronstrue';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { toolkitTranslationRef } from '../../translation';

export const CronDecoder = () => {
  const { t } = useTranslationRef(toolkitTranslationRef);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (input.trim() === '') {
      setOutput('');
      return;
    }
    try {
      const text = cronstrue.toString(input, { verbose: true });
      setOutput(text);
    } catch (error) {
      setOutput(
        t('cron.error', {
          detail: error instanceof Error ? error.message : t('cron.invalid'),
        }),
      );
      return;
    }
  }, [input, t]);

  return (
    <DefaultEditor
      input={input}
      setInput={setInput}
      output={output}
      sample="0 0/10 * 1/1 * ? *"
    />
  );
};

export default CronDecoder;
