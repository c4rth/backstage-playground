import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Flex } from '@backstage/ui';
import { TextField, TextArea } from 'react-aria-components';
import { ClearValueButton, PasteFromClipboardButton, SampleButton } from '../Buttons';
import jsonata from 'jsonata';
import ReactJson from 'react-json-view';

/* ---- Resizable divider ---- */
const DIVIDER_SIZE = 2;

const dividerBaseStyle: React.CSSProperties = {
  flexShrink: 0,
  background: 'var(--bui-gray-4)',
  borderRadius: '3px',
  transition: 'background 0.15s',
};

const useResizable = (
  direction: 'horizontal' | 'vertical',
  initialFraction: number,
  containerRef: React.RefObject<HTMLDivElement | null>,
) => {
  const [fraction, setFraction] = useState(initialFraction);
  const dragging = useRef(false);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      const move = (ev: MouseEvent) => {
        if (!dragging.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        let f: number;
        if (direction === 'horizontal') {
          f = (ev.clientX - rect.left) / rect.width;
        } else {
          f = (ev.clientY - rect.top) / rect.height;
        }
        setFraction(Math.min(0.85, Math.max(0.15, f)));
      };
      const up = () => {
        dragging.current = false;
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    },
    [direction, containerRef],
  );

  return { fraction, onMouseDown };
};

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

const monoStyle: React.CSSProperties = {
  width: '100%',
  flex: 1,
  padding: '8px',
  fontFamily: 'monospace',
  fontSize: '14px',
  border: '1px solid var(--bui-gray-4)',
  boxSizing: 'border-box',
  borderRadius: '4px',
  backgroundColor: 'var(--bui-bg-surface-1)',
  color: 'var(--bui-fg-default)',
  resize: 'none',
};

export const JSONataTester = () => {
  const [input, setInput] = useState('');
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<any>(undefined);
  const [error, setError] = useState<string | null>(null);

  const hContainerRef = useRef<HTMLDivElement | null>(null);
  const vContainerRef = useRef<HTMLDivElement | null>(null);
  const { fraction: hFraction, onMouseDown: onHDividerDown } = useResizable('horizontal', 0.5, hContainerRef);
  const { fraction: vFraction, onMouseDown: onVDividerDown } = useResizable('vertical', 0.35, vContainerRef);

  const evaluate = useCallback(async (jsonStr: string, expr: string) => {
    setError(null);
    setResult(undefined);
    if (!jsonStr || !expr) return;
    try {
      const data = JSON.parse(jsonStr);
      const compiled = jsonata(expr);
      const res = await compiled.evaluate(data);
      setResult(res);
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
    <Flex direction="column" style={{ height: '100%' }}>
      {/* Toolbar */}
      <Flex mb="4" align="center" style={{ alignItems: 'center' }}>
        <Box>
          <ClearValueButton setValue={(v: string) => { setInput(v); setExpression(v); }} />
          <PasteFromClipboardButton setInput={setInput} />
          <SampleButton setInput={loadSample} sample="sample" />
        </Box>
      </Flex>

      {/* Main 3-panel layout */}
      <div ref={hContainerRef} style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left panel – JSON input (full height) */}
        <div style={{ width: `calc(${hFraction * 100}% - ${DIVIDER_SIZE / 2}px)`, display: 'flex', flexDirection: 'column' }}>
          <TextField style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }} aria-label="JSON Input">
            <TextArea
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={20}
              style={monoStyle}
            />
          </TextField>
        </div>

        {/* Horizontal divider */}
        <div
          onMouseDown={onHDividerDown}
          style={{
            ...dividerBaseStyle,
            width: DIVIDER_SIZE,
            cursor: 'col-resize',
            margin: '0 2px',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bui-gray-6)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--bui-gray-4)')}
        />

        {/* Right panels – expression (top) + result (bottom) */}
        <div ref={vContainerRef} style={{ width: `calc(${(1 - hFraction) * 100}% - ${DIVIDER_SIZE / 2}px)`, display: 'flex', flexDirection: 'column' }}>
          {/* Right top – JSONata expression */}
          <div style={{ height: `calc(${vFraction * 100}% - ${DIVIDER_SIZE / 2}px)`, display: 'flex', flexDirection: 'column' }}>
            <TextField style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }} aria-label="JSONata Expression">
              <TextArea
                value={expression}
                onChange={e => setExpression(e.target.value)}
                rows={5}
                style={monoStyle}
              />
            </TextField>
          </div>

          {/* Vertical divider */}
          <div
            onMouseDown={onVDividerDown}
            style={{
              ...dividerBaseStyle,
              height: DIVIDER_SIZE,
              cursor: 'row-resize',
              margin: '2px 0',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bui-gray-6)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--bui-gray-4)')}
          />

          {/* Right bottom – Result */}
          <div style={{ height: `calc(${(1 - vFraction) * 100}% - ${DIVIDER_SIZE / 2}px)`, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '8px',
                fontFamily: 'monospace',
                fontSize: '14px',
                border: '1px solid var(--bui-gray-4)',
                borderRadius: '4px',
                backgroundColor: 'var(--bui-bg-surface-1)',
                color: 'var(--bui-fg-default)',
              }}
            >
              {error ? (
                <Box style={{ color: '#f44336' }}>{error}</Box>
              ) : result !== undefined ? (
                typeof result === 'object' && result !== null ? (
                  <ReactJson
                    name={false}
                    src={result}
                    style={{ backgroundColor: 'transparent' }}
                  />
                ) : (
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
                )
              ) : (
                <Box style={{ color: 'var(--bui-fg-muted)' }}><i>Enter JSON and a JSONata expression to see results</i></Box>
              )}
            </div>
          </div>
        </div>
      </div>
    </Flex>
  );
};

export default JSONataTester;
