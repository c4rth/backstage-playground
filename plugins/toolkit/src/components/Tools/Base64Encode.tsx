import { useState, useEffect } from 'react';
import { DefaultEditor } from '../DefaultEditor';

export const Base64Encode = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('Decode');

  useEffect(() => {
    if (mode === 'Encode') {
      setOutput(Buffer.from(input).toString('base64'));
    } else {
      setOutput(Buffer.from(input, 'base64').toString());
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
      sample={
        mode === 'Encode'
          ? 'Lorem ipsum dolor sit amet'
          : 'TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQ='
      }
    />
  );
};

export default Base64Encode;
