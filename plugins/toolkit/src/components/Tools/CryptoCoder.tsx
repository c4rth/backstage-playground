import { useState, useEffect } from 'react';
import { DefaultEditor } from '../DefaultEditor';
import { PBEWithMD5AndDES } from './crypto/PBEWithMD5AndDES';
import { Flex, TextAreaField, TextField, Select, Option } from '@backstage/ui';
import styles from '../styles/customTextAreaField.module.css';
import { AES, DES, TripleDES, Rabbit, RC4, Utf8 } from 'crypto-es';

const algorithms: Option[] = [
  { label: 'AES', id: 'aes' },
  { label: 'DES', id: 'des' },
  { label: 'TripleDES', id: 'tripledes' },
  { label: 'Rabbit', id: 'rabbit' },
  { label: 'RC4', id: 'rc4' },
  { label: 'PBEWithMD5AndDES (jasypt)', id: 'pbestring' },
];

export const CryptoCoder = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [secretKey, setSecretKey] = useState('my-secret');
  const [mode, setMode] = useState('Encode');
  const [algorithm, setAlgorithm] = useState('aes');
  const pbeStringDecryptor = new PBEWithMD5AndDES();

  function setDecryptedText(output: any) {
    const decryptedText = output.toString(Utf8);
    if (!decryptedText) {
      setOutput('Error while decrypting: Invalid input or secret key');
    } else {
      setOutput(decryptedText);
    }
  }

  useEffect(() => {
    if (!input) {
      setOutput('');
      return;
    }

    if (mode === 'Encode') {
      try {
        switch (algorithm) {
          case 'aes':
            setOutput(AES.encrypt(input, secretKey).toString());
            break;
          case 'des':
            setOutput(DES.encrypt(input, secretKey).toString());
            break;
          case 'tripledes':
            setOutput(TripleDES.encrypt(input, secretKey).toString());
            break;
          case 'rabbit':
            setOutput(Rabbit.encrypt(input, secretKey).toString());
            break;
          case 'rc4':
            setOutput(RC4.encrypt(input, secretKey).toString());
            break;
          case 'pbestring':
            setOutput(pbeStringDecryptor.encrypt(input, secretKey));
            break;
          default:
            setOutput(AES.encrypt(input, secretKey).toString());
        }
      } catch (error) {
        setOutput(`Error while encrypting: ${error}`);
      }
    } else {
      try {
        switch (algorithm) {
          case 'aes':
            setDecryptedText(AES.decrypt(input, secretKey));
            break;
          case 'des':
            setDecryptedText(DES.decrypt(input, secretKey));
            break;
          case 'tripledes':
            setDecryptedText(TripleDES.decrypt(input, secretKey));
            break;
          case 'rabbit':
            setDecryptedText(Rabbit.decrypt(input, secretKey));
            break;
          case 'rc4':
            setDecryptedText(RC4.decrypt(input, secretKey));
            break;
          case 'pbestring':
            setDecryptedText(pbeStringDecryptor.decrypt(input, secretKey));
            break;
          default:
            setDecryptedText(AES.decrypt(input, secretKey));
        }
      } catch (error) {
        setOutput(`Error while decrypting: ${error}`);
      }
    }
  }, [input, mode, secretKey, algorithm]);

  return (
    <DefaultEditor
      input={input}
      mode={mode}
      setInput={setInput}
      setMode={setMode}
      output={output}
      modes={['Decode', 'Encode']}
      leftContent={
        <Flex
          direction="column"
          style={{ gap: '8px', width: '100%', height: '100%', minHeight: 0 }}
        >
          <Select
            style={{ flex: '0 0 auto' }}
            onChange={v => setAlgorithm(v as string)}
            label="Algorithm"
            value={algorithm}
            options={algorithms}
          />
          <TextField
            style={{ flex: '0 0 auto', marginBottom: '8px', marginTop: '8px' }}
            label="Secret key"
            value={secretKey}
            onChange={text => setSecretKey(text)}
          />
          <TextAreaField
            aria-label="Input"
            className={styles.customTextAreaField}
            style={{ flex: '1 1 auto', minHeight: 0 }}
            value={input}
            onChange={text => setInput(text)}
          />
        </Flex>
      }
    />
  );
};

export default CryptoCoder;
