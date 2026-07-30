import { useState, useEffect } from 'react';
import { DefaultEditor } from '../DefaultEditor';
import { PBEStringDecryptor } from './crypto/PBEStringDecryptor';
import { TextAreaField } from '@backstage/ui';

export const Base64Encode = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('Decode');
  const pbeStringDecryptor = new PBEStringDecryptor();

  useEffect(() => {
    if (mode === 'Encode') {
      setOutput(pbeStringDecryptor.encrypt(input, 'my-secret'));
    } else {
      setOutput(pbeStringDecryptor.decrypt(input, 'my-secret'));
    }
  }, [input, mode]);

  return (
    <DefaultEditor
      input={input}
      mode={mode}
      setInput={setInput}
      setMode={setMode}
      output={output}
      modes={['Decode', 'Encode']}
      leftContent={
        <TextAreaField
          aria-label="Input"
          value={input}
          onChange={text => setInput(text)}
          rows={20}
        />
      }
    />
  );
};

export default Base64Encode;
