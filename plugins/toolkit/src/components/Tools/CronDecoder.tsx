import { useState, useEffect } from 'react';
import { DefaultEditor } from '../DefaultEditor';
import cronstrue from 'cronstrue';

export const CronDecoder = () => {
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
      setOutput(`Error: ${error instanceof Error ? error.message : 'Invalid cron expression'}`);
      return;
    }
  }, [input]);

  return (
    <DefaultEditor
      input={input}
      setInput={setInput}
      output={output}
      sample='0 0/10 * 1/1 * ? *'
    />
  );
};

export default CronDecoder;