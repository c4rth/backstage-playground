import { useState, useEffect } from 'react';
import { DefaultEditor } from '../DefaultEditor';
import { PBEWithMD5AndDES } from './crypto/PBEWithMD5AndDES';
import { Flex, TextAreaField, TextField, Select, Option } from '@backstage/ui';
import styles from '../styles/customTextAreaField.module.css';
import { AES, DES, TripleDES, Rabbit, RC4, Utf8 } from 'crypto-es';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { toolkitTranslationRef, ToolkitTranslator } from '../../translation';

const getAlgorithms = (t: ToolkitTranslator): Option[] => [
  { label: t('crypto.algorithms.aes'), id: 'aes' },
  { label: t('crypto.algorithms.des'), id: 'des' },
  { label: t('crypto.algorithms.tripledes'), id: 'tripledes' },
  { label: t('crypto.algorithms.rabbit'), id: 'rabbit' },
  { label: t('crypto.algorithms.rc4'), id: 'rc4' },
  { label: t('crypto.algorithms.pbestring'), id: 'pbestring' },
];

export const CryptoCoder = () => {
  const { t } = useTranslationRef(toolkitTranslationRef);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [secretKey, setSecretKey] = useState('my-secret');
  const [mode, setMode] = useState('Encode');
  const [algorithm, setAlgorithm] = useState('aes');

  useEffect(() => {
    function setDecryptedText(value: any) {
      const decryptedText = value.toString(Utf8);
      if (!decryptedText) {
        setOutput(t('crypto.invalidInput'));
      } else {
        setOutput(decryptedText);
      }
    }

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
            setOutput(PBEWithMD5AndDES.encrypt(input, secretKey, t));
            break;
          default:
            setOutput(AES.encrypt(input, secretKey).toString());
        }
      } catch (error) {
        setOutput(t('crypto.encryptError', { detail: String(error) }));
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
            setDecryptedText(PBEWithMD5AndDES.decrypt(input, secretKey, t));
            break;
          default:
            setDecryptedText(AES.decrypt(input, secretKey));
        }
      } catch (error) {
        setOutput(t('crypto.decryptError', { detail: String(error) }));
      }
    }
  }, [input, mode, secretKey, algorithm, t]);

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
            label={t('crypto.algorithm')}
            value={algorithm}
            options={getAlgorithms(t)}
            aria-label={t('crypto.algorithm')}
          />
          <TextField
            style={{ flex: '0 0 auto', marginBottom: '8px', marginTop: '8px' }}
            label={t('crypto.secretKey')}
            value={secretKey}
            onChange={text => setSecretKey(text)}
          />
          <TextAreaField
            aria-label={t('editor.input')}
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
