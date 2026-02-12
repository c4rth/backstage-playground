import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Flex } from '@backstage/ui';
import { ClearValueButton, PasteFromClipboardButton, SampleButton } from '../../Buttons';
import jsonata from 'jsonata';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { useResizable } from './useResizable';
import { styles, dividerBaseStyle } from './styles';
import { sampleInput, sampleExpression } from './constants';
import { jsonataLanguage } from './jsonata-lang';

export const JSONataTester = () => {
  const [input, setInput] = useState('');
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<any>(undefined);
  const [error, setError] = useState<string | null>(null);

  const mainContainerRef = useRef<HTMLDivElement | null>(null);
  const rightContainerRef = useRef<HTMLDivElement | null>(null);

  const jsonExtensions = useMemo(() => [json()], []);
  const jsonataExtensions = useMemo(() => [jsonataLanguage], []);

  // Layout State
  const { percentage: splitX, onMouseDown: onDragX } = useResizable('horizontal', 50, mainContainerRef);
  const { percentage: splitY, onMouseDown: onDragY } = useResizable('vertical', 35, rightContainerRef, 10, 50);

  const evaluate = useCallback(async (jsonStr: string, expr: string) => {
    setError(null);
    setResult(undefined);
    if (!jsonStr || !expr) return;
    try {
      const data = JSON.parse(jsonStr);
      const compiled = jsonata(expr);
      let pathresult = await compiled.evaluate(data);
      if (typeof pathresult === 'undefined') {
        pathresult = '** no match **';
      } else {
        pathresult = JSON.stringify(pathresult, function (_, val) {
          return (typeof val !== 'undefined' && val !== null && val.toPrecision) ? Number(val.toPrecision(13)) :
            (val && (val._jsonata_lambda === true || val._jsonata_function === true)) ? '{function:' + (val.signature ? val.signature.definition : "") + '}' :
              (typeof val === 'function') ? '<native function>#' + val.length : val;
        }, 2);
      }
      setResult(pathresult);
    } catch (e: any) {
      setError(e.message ?? String(e));
    }
  }, []);

  useEffect(() => {
    evaluate(input, expression);
  }, [input, expression, evaluate]);

  const loadSample = useCallback(() => {
    setInput(sampleInput);
    setExpression(sampleExpression);
  }, []);

  return (
    <div style={styles.container}>
      {/* Toolbar */}
      <Flex align="center" style={{ alignItems: 'center' }}>
        <Box>
          <ClearValueButton setValue={(v: string) => { setInput(v); setExpression(v); }} />
          <PasteFromClipboardButton setInput={setInput} />
          <SampleButton setInput={loadSample} sample="sample" />
        </Box>
      </Flex>

      {/* Main Split (Left vs Right) */}
      <div ref={mainContainerRef} style={styles.mainGrid(splitX)}>

        {/* Left Panel: Input */}
        <div style={styles.panel}>
          <div style={styles.panelContent}>
            <CodeMirror
              width="100%"
              height="100%"
              style={{ height: '100%' }}
              value={input}
              basicSetup={{
                lineNumbers: true,
                syntaxHighlighting: true,
              }}
              onChange={newValue => setInput(newValue ?? '')}
              extensions={jsonExtensions}
            />
          </div>
        </div>

        {/* Vertical Grabber */}
        <div
          onMouseDown={onDragX}
          style={{ ...dividerBaseStyle, cursor: 'col-resize' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bui-gray-6)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--bui-gray-4)')}
        />

        {/* Right Panel: Split (Top vs Bottom) */}
        <div ref={rightContainerRef} style={styles.rightGrid(splitY)}>

          {/* Top Right: Expression */}
          <div style={styles.panel}>
            <div style={styles.panelContent}>
              <CodeMirror
                width="100%"
                height="100%"
                style={{ height: '100%' }}
                value={expression}
                onChange={newValue => setExpression(newValue ?? '')}
                basicSetup={{
                  lineNumbers: true,
                  syntaxHighlighting: true,
                }}
                extensions={jsonataExtensions}
              />
            </div>
          </div>

          {/* Horizontal Grabber */}
          <div
            onMouseDown={onDragY}
            style={{ ...dividerBaseStyle, cursor: 'row-resize' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bui-gray-6)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--bui-gray-4)')}
          />

          {/* Bottom Right: Result */}
          <div style={styles.panel}>
            <div style={styles.resultBox}>
              {error ? (
                <Box style={{ color: '#f44336' }}>{error}</Box>
              ) :
                <CodeMirror
                  value={result}
                  height="100%"
                  style={{ height: '100%' }}
                  readOnly={true}
                  extensions={jsonExtensions}
                  basicSetup={{
                    lineNumbers: true,
                    syntaxHighlighting: true,
                  }}
                />
              }
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default JSONataTester;