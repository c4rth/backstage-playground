import { ReactElement } from 'react';
import {
    ClearValueButton,
    CopyToClipboardButton,
    PasteFromClipboardButton,
    SampleButton,
} from '../Buttons';
import { TextField } from '@material-ui/core';
import { Box, Flex, Grid } from '@backstage/ui';
import { Chip } from '@internal/plugin-api-platform-react';

type Props = {
    input: string;
    setInput: (value: string) => void;
    output?: string;
    mode?: string;
    minRows?: number;
    inputLabel?: string;
    outputLabel?: string;
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
        inputLabel = 'Input',
        outputLabel = 'Output',
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
        <>
            <Flex mb='4' align='center' style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    {modes && modes.length > 0 && (
                        <>
                            {modes.map(m => (
                                <Chip
                                    key={m}
                                    label={m}
                                    onClick={() => setMode && setMode(m)}
                                    color={mode === m ? 'primary' : 'default'}
                                    style={{ marginRight: '1rem'}}
                                />
                            ))}
                        </>
                    )}
                    <ClearValueButton setValue={setInput} />
                    <PasteFromClipboardButton setInput={setInput} />
                    {output && <CopyToClipboardButton output={output} />}
                    {sample && <SampleButton setInput={setInput} sample={sample} />}
                </Box>
                {additionalTools && additionalTools.length > 0 && (
                    <Grid.Item>{additionalTools.map(tool => tool)}</Grid.Item>
                )}
            </Flex>
            <Grid.Root>
                <Grid.Item
                    style={{ paddingTop: '8px !important', paddingLeft: '8px !important' }}
                >
                    {leftContent ?? (
                        <TextField
                            label={inputLabel}
                            // eslint-disable-next-line
                            id="input"
                            multiline
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            minRows={minRows}
                            variant="outlined"
                            style={{
                                width: '100%',
                                padding: '8px',
                            }}
                        />
                    )}
                    {extraLeftContent}
                </Grid.Item>
                <Grid.Item
                    style={{ padding: '8px !important' }}>
                    {rightContent ?? (
                        <TextField
                            id="output"
                            label={outputLabel}
                            value={output || ''}
                            multiline
                            minRows={minRows}
                            variant="outlined"
                            style={{
                                width: '100%',
                                padding: '8px',
                            }}
                        />
                    )}
                    {extraRightContent}
                </Grid.Item>
            </Grid.Root>
        </>
    );
};