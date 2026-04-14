import { ReactElement } from 'react';
import {
    ClearValueButton,
    CopyToClipboardButton,
    PasteFromClipboardButton,
    SampleButton,
} from '../Buttons';
import { TextField, TextArea, } from 'react-aria-components';
import { Box, Flex, Grid } from '@backstage/ui';
import { Chip } from '@internal/plugin-api-platform-react';

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
        <Flex direction="column" style={{ height: '100%' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flex direction="row" style={{ alignItems: 'center', marginRight: '24px', flexWrap: 'wrap' }}>
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
            <Grid.Root style={{ flex: 1, display: 'flex' }}>
                <Grid.Item
                    style={{ paddingTop: '8px !important', paddingLeft: '8px !important', display: 'flex', flexDirection: 'column', width: '50%' }}
                >
                    {leftContent ?? (
                        <TextField style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }} aria-label='Input'>
                            <TextArea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                rows={minRows}
                                style={{
                                    width: '100%',
                                    flex: 1,
                                    padding: '8px',
                                    fontFamily: 'monospace',
                                    fontSize: '14px',
                                    border: '1px solid var(--bui-gray-4)',
                                    boxSizing: 'border-box',
                                    borderRadius: '4px',
                                    backgroundColor: 'var(--bui-bg-neutral-1)',
                                    color: 'var(--bui-fg-default)',
                                    resize: 'none',
                                }}
                            />
                        </TextField>
                    )}
                    {extraLeftContent}
                </Grid.Item>
                <Grid.Item
                    style={{ padding: '8px !important', display: 'flex', flexDirection: 'column', width: '50%' }}>
                    {rightContent ?? (
                        <TextField style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }} aria-label='Output'>
                            <TextArea
                                value={output || ''}
                                rows={minRows}
                                readOnly
                                style={{
                                    width: '100%',
                                    flex: 1,
                                    padding: '8px',
                                    fontFamily: 'monospace',
                                    fontSize: '14px',
                                    border: '1px solid var(--md-sys-color-outline, #ccc)',
                                    borderRadius: '4px',
                                    backgroundColor: 'var(--md-sys-color-surface, #fff)',
                                    color: 'var(--md-sys-color-on-surface, #000)',
                                    resize: 'none',
                                }}
                            />
                        </TextField>
                    )}
                    {extraRightContent}
                </Grid.Item>
            </Grid.Root>
        </Flex>
    );
};