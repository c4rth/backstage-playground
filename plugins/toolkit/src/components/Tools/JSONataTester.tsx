import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Flex } from '@backstage/ui';
import { TextField, TextArea } from 'react-aria-components';
import { ClearValueButton, PasteFromClipboardButton, SampleButton } from '../Buttons';
import jsonata from 'jsonata';
import ReactJson from 'react-json-view';

/* ---- Resizable divider (preserved styles) ---- */
const DIVIDER_SIZE = 4; // Increased grab area slightly for better UX

const dividerBaseStyle: React.CSSProperties = {
  flexShrink: 0,
  background: 'var(--bui-gray-4)',
  borderRadius: '3px',
  transition: 'background 0.15s',
  position: 'relative',
  zIndex: 10,
};

/* ---- Simplified Resizable Hook (returns percentages for Grid) ---- */
const useResizable = (
  direction: 'horizontal' | 'vertical',
  initialPercentage: number, // 0 to 100
  containerRef: React.RefObject<HTMLDivElement | null>,
  minPercentage = 15,
  maxPercentage = 85,
) => {
  const [percentage, setPercentage] = useState(initialPercentage);
  const dragging = useRef(false);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';

      const move = (ev: MouseEvent) => {
        if (!dragging.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        let p: number;

        if (direction === 'horizontal') {
          p = ((ev.clientX - rect.left) / rect.width) * 100;
        } else {
          p = ((ev.clientY - rect.top) / rect.height) * 100;
        }

        setPercentage(Math.min(maxPercentage, Math.max(minPercentage, p)));
      };

      const up = () => {
        dragging.current = false;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };

      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    },
    [direction, containerRef, minPercentage, maxPercentage],
  );

  return { percentage, onMouseDown };
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
  height: '100%',
  padding: '8px',
  fontFamily: 'monospace',
  fontSize: '14px',
  border: '1px solid var(--bui-gray-4)',
  boxSizing: 'border-box',
  borderRadius: '4px',
  backgroundColor: 'var(--bui-bg-surface-1)',
  color: 'var(--bui-fg-default)',
  resize: 'none',
  outline: 'none',
};

const styles = {
  container: { height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' as const },
  toolbar: { padding: '8px', borderBottom: '1px solid var(--bui-gray-4)', flexShrink: 0 },

  // Main Grid Layout for Left/Right split
  mainGrid: (percentage: number) => ({
    display: 'grid',
    gridTemplateColumns: `${percentage}% ${DIVIDER_SIZE}px minmax(0, 1fr)`,
    flex: 1,
    minHeight: 0,
    width: '100%',
    overflow: 'hidden',
  }),

  // Right Grid Layout for Top/Bottom split
  rightGrid: (percentage: number) => ({
    display: 'grid',
    gridTemplateRows: `${percentage}% ${DIVIDER_SIZE}px minmax(0, 1fr)`,
    height: '100%',
    width: '100%',
    minHeight: 0,
    overflow: 'hidden',
  }),

  panel: {
    overflow: 'hidden',
    position: 'relative' as const,
    height: '100%',
    width: '100%',
    minWidth: 0,
    minHeight: 0,
  },

  panelContent: {
    position: 'absolute' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    overflow: 'hidden',
  },

  resultBox: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'auto',
    padding: '8px',
    fontFamily: 'monospace',
    fontSize: '14px',
    border: '1px solid var(--bui-gray-4)',
    borderRadius: '4px',
    backgroundColor: 'var(--bui-bg-surface-1)',
    color: 'var(--bui-fg-default)',
    boxSizing: 'border-box' as const,
  }
};

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
      const expression = jsonata(expr);
      const res = await expression.evaluate(data);
      // Strip internal JSONata properties (e.g. 'sequence') via JSON round-trip
      setResult(JSON.parse(JSON.stringify(res)));
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
            <TextField aria-label="JSON Input" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <TextArea
                value={input}
                onChange={e => setInput(e.target.value)}
                style={monoStyle}
              />
            </TextField>
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
              <TextField aria-label="JSONata Expression" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <TextArea
                  value={expression}
                  onChange={e => setExpression(e.target.value)}
                  style={monoStyle}
                />
              </TextField>
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
              ) : result !== undefined ? (
                typeof result === 'object' && result !== null ? (
                  <>
                    <ReactJson
                      name={false}
                      src={result}
                      style={{ backgroundColor: 'transparent' }}
                      enableClipboard={true}
                    />
                  </>
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
    </div>
  );
};

export default JSONataTester;
