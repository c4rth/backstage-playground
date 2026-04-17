import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Flex } from '@backstage/ui';
import { ClearValueButton, PasteFromClipboardButton, SampleButton } from '../../Buttons';
import jsonata from 'jsonata';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeLight } from '@uiw/codemirror-theme-vscode';
import { json } from '@codemirror/lang-json';
import { styles, dividerBaseStyle } from './styles';
import { jsonataLanguage } from './codemirror-jsonata';
import { registerCustomFunctions, loadFuncBindings } from './jsonata-functions';
import { useResizable } from '../../../hooks';

const sampleInput = JSON.stringify(
  {
    account: {
      accountName: 'Firefly',
      order: [
        { orderID: 'order103', product: [{ productName: 'Bowler Hat', productID: 858383, sku: '0406654608', description: { colour: 'Purple', width: 300, height: 200, depth: 210, weight: 0.75 }, price: 34.45, quantity: 2 }, { productName: 'Trilby hat', productID: 858236, sku: '0406634348', description: { colour: 'Orange', width: 300, height: 200, depth: 210, weight: 0.6 }, price: 21.67, quantity: 1 }] },
        { orderID: 'order104', product: [{ productName: 'Bowler Hat', productID: 858383, sku: '040657863', description: { colour: 'Purple', width: 300, height: 200, depth: 210, weight: 0.75 }, price: 34.45, quantity: 4 }, { productID: 345664, sku: '0406654603', productName: 'Cloak', description: { colour: 'Black', width: 30, height: 20, depth: 210, weight: 2 }, price: 107.99, quantity: 1 }] },
      ],
    },
  },
  null,
  2,
);

const sampleExpression = 'account.order.product.price';

export const JSONataTester = () => {
  const [input, setInput] = useState('{}');
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

  const formatValue = (val: any): any => {
    if (typeof val !== 'undefined' && val !== null && val.toPrecision) {
      return Number(val.toPrecision(13));
    }
    if (val && (val._jsonata_lambda === true || val._jsonata_function === true)) {
      return `{function:${val.signature ? val.signature.definition : ""}}`;
    }
    if (typeof val === 'function') {
      return `<native function>#${val.length}`;
    }
    return val;
  };

  const evaluate = useCallback(async (jsonStr: string, expr: string) => {
    setError(null);
    setResult(undefined);
    if (!jsonStr || !expr) return;
    try {
      const data = JSON.parse(jsonStr);
      const jsonataExpr = jsonata(expr);
      registerCustomFunctions(jsonataExpr);
      const funcBindings = await loadFuncBindings();
      let pathresult = await jsonataExpr.evaluate(data, funcBindings);
      if (typeof pathresult === 'undefined') {
        pathresult = '** no match **';
      } else {
        pathresult = JSON.stringify(pathresult, (_, val) => formatValue(val), 2);
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
          <ClearValueButton setValue={(v: string) => { setInput(v); setExpression(''); }} defaultValue='{}'/>
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
              theme={vscodeLight}
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
          role="presentation"
          onMouseDown={onDragX}
          style={{ ...dividerBaseStyle, cursor: 'col-resize' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bui-border-2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--bui-border-1)')}
          aria-label="Resize horizontal divider"
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
                theme={vscodeLight}
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
            role="presentation"
            onMouseDown={onDragY}
            style={{ ...dividerBaseStyle, cursor: 'row-resize' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bui-border-2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--bui-border-1)')}
            aria-label="Resize vertical divider"
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
                  readOnly
                  extensions={jsonExtensions}
                  theme={vscodeLight}
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