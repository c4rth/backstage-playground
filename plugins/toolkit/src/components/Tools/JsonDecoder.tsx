import { useEffect, useState } from 'react';
import { DefaultEditor } from '../DefaultEditor';
import { Box } from '@backstage/ui';
import ReactJson from 'react-json-view';
import { useApi } from '@backstage/core-plugin-api';
import { appThemeApiRef } from '@backstage/core-plugin-api';

export const JsonDecoder = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<any>(undefined);
  const appThemeApi = useApi(appThemeApiRef);
  const [isDarkMode] = useState(() => {
    const currentThemeId = appThemeApi.getActiveThemeId();
    const preferedColor = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    return currentThemeId?.includes('dark') ?? preferedColor;
  });

  const JsonDecoderOutput = (props: {
    json?: any;
    signatureVerified?: boolean | null;
    verificationError?: string;
  }) => {
    return (
      <Box
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {props.json ? (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflow: 'auto',
              overflowX: 'auto',
              overflowY: 'auto',
              border: '1px solid var(--bui-border-1)',
              borderRadius: '4px',
              backgroundColor: 'var(--bui-bg-neutral-1)',
            }}
          >
            <ReactJson
              name={false}
              src={props.json || {}}
              style={{
                boxSizing: 'border-box',
                backgroundColor: 'transparent',
              }}
              theme={isDarkMode ? 'monokai' : 'rjv-default'}
              quotesOnKeys={false}
              displayDataTypes={false}
              enableClipboard
            />
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '8px',
              fontFamily: 'monospace',
              fontSize: '14px',
              border: '1px solid var(--bui-border-1)',
              borderRadius: '4px',
              backgroundColor: 'var(--bui-bg-neutral-1)',
              color: 'var(--bui-fg-primary)',
            }}
          >
            <Box>
              <i>No JSON data available</i>
            </Box>
          </div>
        )}
      </Box>
    );
  };

  useEffect(() => {
    if (!input) {
      setOutput(undefined);
      return;
    }
    const value = input;
    if (value) {
      try {
        setOutput(JSON.parse(value));
      } catch (error) {
        setOutput(`Couldn't decode JSON: ${error}`);
      }
    } else {
      setOutput(undefined);
    }
  }, [input]);

  return (
    <DefaultEditor
      input={input}
      mode="Decode"
      setInput={setInput}
      output={output}
      rightContent={<JsonDecoderOutput json={output} />}
    />
  );
};

export default JsonDecoder;
