import { ReactElement } from 'react';
import {
  ClearValueButton,
  CopyToClipboardButton,
  PasteFromClipboardButton,
  SampleButton,
} from '../Buttons';
import { Box, Flex, Grid, TextAreaField } from '@backstage/ui';
import { Chip } from '@internal/plugin-components-react';
import styles from '../styles/customTextAreaField.module.css';

type Props = {
  input: string;
  setInput: (value: string) => void;
  output?: string;
  mode?: string;
  minRows?: number;
  setMode?: (value: string) => void;
  modes?: Array<string>;
  leftContent?: ReactElement;
  extraLeftContent?: ReactElement;
  rightContent?: ReactElement;
  extraRightContent?: ReactElement;
  sample?: string;
  additionalTools?: ReactElement[];
  inputProps?: any;
  outputProps?: any;
};

export const DefaultEditor = (props: Props) => {
  const {
    input,
    setInput,
    output,
    mode,
    setMode,
    modes,
    leftContent,
    extraLeftContent,
    rightContent,
    extraRightContent,
    sample,
    additionalTools,
    minRows = 20,
  } = props;

  return (
    <Flex direction="column" style={{ height: '100%', minHeight: 0 }}>
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0px',
        }}
      >
        <Flex
          direction="row"
          style={{
            alignItems: 'center',
            marginLeft: '8px',
            marginRight: '24px',
            flexWrap: 'wrap',
          }}
        >
          {modes && modes.length > 0 && (
            <>
              {modes.map(m => (
                <Chip
                  key={m}
                  label={m}
                  onClick={() => setMode && setMode(m)}
                  color={mode === m ? 'primary' : 'default'}
                />
              ))}
            </>
          )}
          <ClearValueButton setValue={setInput} />
          <PasteFromClipboardButton setInput={setInput} />
          {output && <CopyToClipboardButton output={output} />}
          {sample && <SampleButton setInput={setInput} sample={sample} />}
          {additionalTools && additionalTools.length > 0 && (
            <Grid.Item>{additionalTools.map(tool => tool)}</Grid.Item>
          )}
        </Flex>
      </Box>
      <Grid.Root style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Grid.Item
          style={{
            paddingTop: '8px !important',
            paddingLeft: '8px !important',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            width: '50%',
            flex: 1,
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              overflow: 'hidden',
              height: '100%',
              width: '100%',
            }}
          >
            {leftContent ?? (
              <TextAreaField
                className={styles.customTextAreaField}
                aria-label="Input"
                value={input}
                onChange={text => setInput(text)}
                rows={minRows}
              />
            )}
            {extraLeftContent}
          </div>
        </Grid.Item>
        <Grid.Item
          style={{
            width: '100%',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden',
            padding: '8px !important',
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              overflow: 'hidden',
              height: '100%',
              width: '100%',
            }}
          >
            {rightContent ?? (
              <TextAreaField
                className={styles.customTextAreaField}
                aria-label="Output"
                value={output || ''}
                rows={minRows}
                isReadOnly
              />
            )}
            {extraRightContent}
          </div>
        </Grid.Item>
      </Grid.Root>
    </Flex>
  );
};
