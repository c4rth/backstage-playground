import { ReactElement } from 'react';
import {
    ClearValueButton,
    CopyToClipboardButton,
    PasteFromClipboardButton,
    SampleButton,
} from '../Buttons';
import { Button, ButtonGroup, Grid, TextField } from '@material-ui/core';

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
            <Grid container spacing={4} style={{ marginBottom: '5px' }}>
                {modes && modes.length > 0 && (
                    <Grid item style={{ paddingLeft: '16px', paddingTop: '32px !important' }}>
                        <ButtonGroup
                            size="small"
                            disableElevation
                            variant="contained"
                            aria-label="Disabled elevation buttons"
                            style={{ marginBottom: '1rem' }}
                            color="inherit"
                        >
                            {modes.map(m => (
                                <Button
                                    size="small"
                                    key={m}
                                    onClick={() => setMode && setMode(m)}
                                    variant={mode === m ? 'contained' : 'outlined'}
                                    color="inherit"
                                    style={{
                                        ...(mode === m && {
                                            color: '#000000',
                                            backgroundColor: '#E0E0E0',
                                        }),
                                        ...(mode !== m && {
                                            borderColor: '#E0E0E0',
                                        }),
                                    }}
                                >
                                    {m}
                                </Button>
                            ))}
                        </ButtonGroup>
                    </Grid>
                )}
                <Grid item style={{ padding: '16px' }}>
                    <ButtonGroup size="small" color="secondary">
                        <ClearValueButton setValue={setInput} />
                        <PasteFromClipboardButton setInput={setInput} />
                        {output && <CopyToClipboardButton output={output} />}
                        {sample && <SampleButton setInput={setInput} sample={sample} />}
                    </ButtonGroup>
                </Grid>
                {additionalTools && additionalTools.length > 0 && (
                    <Grid item>{additionalTools.map(tool => tool)}</Grid>
                )}
            </Grid>
            <Grid container>
                <Grid
                    item
                    xs={12}
                    lg={6}
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
                </Grid>
                <Grid
                    item 
                    xs={12}
                    lg={6}
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
                </Grid>
            </Grid>
        </>
    );
};