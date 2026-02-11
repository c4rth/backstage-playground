import { useCallback, useEffect, useState } from 'react';
import { Box, Flex } from '@backstage/ui';
import { TextField, TextArea } from 'react-aria-components';
import { ClearValueButton, PasteFromClipboardButton, SampleButton } from '../Buttons';
import jsonata from 'jsonata';
import ReactJson from 'react-json-view';

const sampleInput = JSON.stringify(
  {
    Account: {
      'Account Name': 'Firefly',
      Order: [
        { OrderID: 'order103', Product: [{ 'Product Name': 'Bowler Hat', ProductID: 858383, SKU: '0406654608', Description: { Colour: 'Purple', Width: 300, Height: 200, Depth: 210, Weight: 0.75 }, Price: 34.45, Quantity: 2 }, { 'Product Name': 'Trilby hat', ProductID: 858236, SKU: '0406634348', Description: { Colour: 'Orange', Width: 300, Height: 200, Depth: 210, Weight: 0.6 }, Price: 21.67, Quantity: 1 }] },
        { OrderID: 'order104', Product: [{ 'Product Name': 'Bowler Hat', ProductID: 858383, SKU: '040657863', Description: { Colour: 'Purple', Width: 300, Height: 200, Depth: 210, Weight: 0.75 }, Price: 34.45, Quantity: 4 }, { ProductID: 345664, SKU: '0406654603', 'Product Name': 'Cloak', Description: { Colour: 'Black', Width: 30, Height: 20, Depth: 210, Weight: 2 }, Price: 107.99, Quantity: 1 }] },
      ],
    },
  },
  null,
  2,
);

const sampleExpression = 'Account.Order.Product.Price';

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
      <div style={{ display: 'flex', flex: 1, gap: '16px', minHeight: 0 }}>
        {/* Left panel – JSON input (full height) */}
        <div style={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
          <TextField style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }} aria-label="JSON Input">
            <TextArea
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={20}
              style={monoStyle}
            />
          </TextField>
        </div>

        {/* Right panels – expression (top) + result (bottom) */}
        <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Right top – JSONata expression */}
          <TextField style={{ width: '100%', display: 'flex', flexDirection: 'column' }} aria-label="JSONata Expression">
            <TextArea
              value={expression}
              onChange={e => setExpression(e.target.value)}
              rows={5}
              style={monoStyle}
            />
          </TextField>

          {/* Right bottom – Result */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
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
