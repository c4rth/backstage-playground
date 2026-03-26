import { useCallback, useEffect, useState } from 'react';
import { DefaultEditor } from '../DefaultEditor';
import {
  camelCase,
  capitalize,
  kebabCase,
  lowerCase,
  snakeCase,
  upperCase,
} from 'lodash';

export const StringUtilities = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('Camel');

  const sample = [
    'requestURLDecoder',
    'HTTP_CLIENT_FACTORY',
    'generic_activity',
    'WeirdActivity',
    'kebab-is-good',
    'Normal text',
  ].join('\n');

  const mapLinesAndJoin = (str: string, callback: (line: string) => string) => {
    return str.split('\n').map(callback).join('\n');
  };

  const transformString = useCallback(
    (
      inputString: string,
      transformMode: string,
    ) => {
      switch (transformMode) {
        case 'Camel':
          return mapLinesAndJoin(inputString, camelCase);
        case 'Snake':
          return mapLinesAndJoin(inputString, snakeCase);
        case 'Kebab':
          return mapLinesAndJoin(inputString, kebabCase);
        case 'Upper':
          return mapLinesAndJoin(inputString, upperCase);
        case 'Lower':
          return mapLinesAndJoin(inputString, lowerCase);
        case 'Capitalize':
          return mapLinesAndJoin(inputString, capitalize);
        default:
          return inputString;
      }
    },
    [],
  );

  useEffect(() => {
    try {
      setOutput(
        transformString(
          input,
          mode
        ),
      );
    } catch (e) {
      setOutput((e as Error).message);
    }
  }, [
    input,
    mode,
    transformString,
  ]);

  return (
    <DefaultEditor
      input={input}
      mode={mode}
      setInput={setInput}
      setMode={setMode}
      output={output}
      modes={[
        'Camel',
        'Snake',
        'Kebab',
        'Upper',
        'Lower',
        'Capitalize',
      ]}
      sample={sample}
    />
  );
};

export default StringUtilities;