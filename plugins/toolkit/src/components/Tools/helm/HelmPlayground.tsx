import { useEffect, useMemo, useRef, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { coreApis, useTranslationRef } from '@backstage/frontend-plugin-api';
import { ResponseError } from '@backstage/errors';
import { Button, Flex, Text } from '@backstage/ui';
import { yaml } from '@codemirror/lang-yaml';
import { EditorView } from '@codemirror/view';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import CodeMirror from '@uiw/react-codemirror';
import {
  ClearValueButton,
  CopyToClipboardButton,
  SampleButton,
} from '../../Buttons';
import { toolkitTranslationRef } from '../../../translation';
import { useResizable } from '../../../hooks';
import { dividerBaseStyle, styles as splitStyles } from '../jsonata/styles';
import { sampleFiles, sampleValues } from './sample';
import { ChartFileEditor } from './ChartFileEditor';
import styles from './HelmPlayground.module.css';

const baseChartFiles = {
  'Chart.yaml': sampleFiles['Chart.yaml'],
  'values.yaml': sampleFiles['values.yaml'],
};

export const HelmPlayground = () => {
  const { t } = useTranslationRef(toolkitTranslationRef);
  const discoveryApi = useApi(coreApis.discovery);
  const fetchApi = useApi(coreApis.fetch);
  const appThemeApi = useApi(coreApis.appTheme);
  const [isDarkMode] = useState(
    () =>
      appThemeApi.getActiveThemeId()?.includes('dark') ??
      window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  const [files, setFiles] = useState<Record<string, string>>(baseChartFiles);
  const [values, setValues] = useState('');
  const [output, setOutput] = useState('');
  const [warnings, setWarnings] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const requestRef = useRef<AbortController>();
  const yamlExtensions = useMemo(() => [yaml()], []);
  const mainContainerRef = useRef<HTMLDivElement | null>(null);
  const rightContainerRef = useRef<HTMLDivElement | null>(null);
  const { percentage: splitX, onMouseDown: onDragX } = useResizable(
    'horizontal',
    50,
    mainContainerRef,
  );
  const { percentage: splitY, onMouseDown: onDragY } = useResizable(
    'vertical',
    35,
    rightContainerRef,
    10,
    50,
  );

  useEffect(() => () => requestRef.current?.abort(), []);

  const resetResult = () => {
    requestRef.current?.abort();
    setIsRendering(false);
    setOutput('');
    setWarnings('');
    setError(null);
  };

  const render = async () => {
    resetResult();
    const request = new AbortController();
    requestRef.current = request;
    setIsRendering(true);
    try {
      const baseUrl = await discoveryApi.getBaseUrl('toolkit');
      if (request.signal.aborted) {
        return;
      }
      const response = await fetchApi.fetch(`${baseUrl}/helm/render`, {
        method: 'POST',
        signal: request.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files, values }),
      });
      if (!response.ok) {
        throw await ResponseError.fromResponse(response);
      }
      const result: unknown = await response.json();
      if (
        !result ||
        typeof result !== 'object' ||
        !('output' in result) ||
        typeof result.output !== 'string' ||
        !('warnings' in result) ||
        typeof result.warnings !== 'string'
      ) {
        throw new Error(t('helm.invalidResponse'));
      }
      if (!request.signal.aborted) {
        setOutput(result.output);
        setWarnings(result.warnings);
      }
    } catch (err) {
      if (!request.signal.aborted) {
        const message = err instanceof Error ? err.message : String(err);
        setError(ResponseError.is(err) ? err.cause.message : message);
      }
    } finally {
      if (!request.signal.aborted) {
        setIsRendering(false);
      }
    }
  };

  const renderedContent = error ? t('helm.error', { detail: error }) : output;
  const panels = [
    {
      id: 'values',
      label: t('helm.values'),
      value: values,
      onChange: (value: string) => {
        resetResult();
        setValues(value);
      },
    },
    {
      id: 'output',
      label: t('helm.output'),
      value: renderedContent,
      readOnly: true,
    },
  ];
  const editors = panels.map(panel => (
    <section key={panel.id} aria-label={panel.label} className={styles.panel}>
      <div
        className={styles.editor}
        role={panel.id === 'output' && error ? 'alert' : undefined}
      >
        <CodeMirror
          value={panel.value}
          onChange={panel.onChange}
          readOnly={panel.readOnly}
          editable={!panel.readOnly}
          width="100%"
          height="100%"
          style={{ height: '100%' }}
          theme={isDarkMode ? vscodeDark : vscodeLight}
          extensions={[
            ...(panel.id === 'output' && error ? [] : yamlExtensions),
            EditorView.contentAttributes.of({
              'aria-label': panel.label,
            }),
          ]}
        />
      </div>
    </section>
  ));

  return (
    <div className={styles.container}>
      <Flex
        direction="row"
        style={{
          alignItems: 'center',
          marginLeft: '8px',
          marginRight: '24px',
          flexWrap: 'wrap',
        }}
      >
        <Button
          size="small"
          onPress={render}
          isDisabled={
            isRendering ||
            !Object.keys(files).some(name => name.startsWith('templates/'))
          }
        >
          {isRendering ? t('helm.rendering') : t('helm.render')}
        </Button>
        <SampleButton
          sample={sampleFiles}
          setInput={value => {
            resetResult();
            setFiles(value);
            setValues(sampleValues);
          }}
        />
        <ClearValueButton
          setValue={() => {
            resetResult();
            setFiles(baseChartFiles);
            setValues('');
          }}
        />
        {renderedContent && <CopyToClipboardButton output={renderedContent} />}
      </Flex>
      {warnings && (
        <div role="status" className={styles.message}>
          <Text>{t('helm.warnings', { detail: warnings })}</Text>
        </div>
      )}
      <div
        ref={mainContainerRef}
        className={styles.editors}
        style={{
          gridTemplateColumns: splitStyles.mainGrid(splitX).gridTemplateColumns,
        }}
      >
        <ChartFileEditor
          files={files}
          theme={isDarkMode ? vscodeDark : vscodeLight}
          onChange={nextFiles => {
            resetResult();
            setFiles(nextFiles);
          }}
        />
        <div
          role="presentation"
          className={styles.columnDivider}
          aria-label={t('helm.resizeHorizontal')}
          onMouseDown={onDragX}
          style={{ ...dividerBaseStyle, cursor: 'col-resize' }}
          onMouseEnter={event =>
            (event.currentTarget.style.background = 'var(--bui-border-2)')
          }
          onMouseLeave={event =>
            (event.currentTarget.style.background = 'var(--bui-border-1)')
          }
        />
        <div
          ref={rightContainerRef}
          className={styles.rightEditors}
          style={{
            gridTemplateRows: splitStyles.rightGrid(splitY).gridTemplateRows,
          }}
        >
          {editors[0]}
          <div
            role="presentation"
            aria-label={t('helm.resizeVertical')}
            onMouseDown={onDragY}
            style={{ ...dividerBaseStyle, cursor: 'row-resize' }}
            onMouseEnter={event =>
              (event.currentTarget.style.background = 'var(--bui-border-2)')
            }
            onMouseLeave={event =>
              (event.currentTarget.style.background = 'var(--bui-border-1)')
            }
          />
          {editors[1]}
        </div>
      </div>
    </div>
  );
};

export default HelmPlayground;
