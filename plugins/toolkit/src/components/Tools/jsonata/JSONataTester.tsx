import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Flex } from '@backstage/ui';
import { ClearValueButton, PasteFromClipboardButton, SampleButton } from '../../Buttons';
import jsonata from 'jsonata';
import Editor from '@monaco-editor/react';
import { useResizable } from './useResizable';
import { styles, dividerBaseStyle } from './styles';
import { sampleInput, sampleExpression } from './constants';
import registerJsonata from './JSONataMode';

export const JSONataTester = () => {
  const [input, setInput] = useState('');
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<any>(undefined);
  const [error, setError] = useState<string | null>(null);

  const mainContainerRef = useRef<HTMLDivElement | null>(null);
  const rightContainerRef = useRef<HTMLDivElement | null>(null);

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
      /*
      // Strip internal JSONata properties (e.g. 'sequence') via JSON round-trip
      if (typeof res === 'object' && res !== null) {
        const cleaned = JSON.parse(JSON.stringify(res));
        setResult(cleaned);
      } else {
        setResult("** no match **");
      }*/
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
            <Editor
              width="100%"
              height="100%"
              language="json"
              theme="jsonataTheme"
              value={input}
              options={{
                lineNumbers: 'off',
                minimap: { enabled: false },
                automaticLayout: true,
                contextmenu: false,
                scrollBeyondLastLine: false,
              }}
              onChange={newValue => setInput(newValue ?? '')}
              beforeMount={registerJsonata}
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
              <Editor              
                width="100%"
                height="100%"
                language="jsonata"
                theme='jsonataTheme'
                value={expression}
                options={{
                  lineNumbers: 'off',
                  minimap: { enabled: false },
                  automaticLayout: true,
                  contextmenu: false,
                  scrollBeyondLastLine: false,
                }}
                onChange={newValue => setExpression(newValue ?? '')}
                beforeMount={registerJsonata}
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
                <Editor
                  language="json"
                  theme="jsonataTheme"
                  value={result}
                  options={{
                    lineNumbers: 'off',
                    minimap: { enabled: false },
                    automaticLayout: true,
                    contextmenu: false,
                    scrollBeyondLastLine: false,
                    readOnly: true,
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

/*
<Editor
                  language="json"
                  value={result}
                  options={{
                    lineNumbers: 'off',
                    minimap: { enabled: false },
                    automaticLayout: true,
                    contextmenu: false,
                    scrollBeyondLastLine: false,
                    readOnly: true,
                  }}
                />
                */