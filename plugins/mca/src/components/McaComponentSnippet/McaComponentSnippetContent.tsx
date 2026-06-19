import type { } from 'react-syntax-highlighter';
import LightAsync from 'react-syntax-highlighter/dist/esm/light-async';
import docco from 'react-syntax-highlighter/dist/esm/styles/hljs/docco';
import { Box, ButtonIcon, Flex } from '@backstage/ui';
import { RiFileCopy2Line, RiFileDownloadFill } from '@remixicon/react';
import { MouseEventHandler, useEffect } from 'react';
import { alertApiRef, errorApiRef, useApi } from '@backstage/core-plugin-api';
import useCopyToClipboard from 'react-use/esm/useCopyToClipboard';

export interface McaComponentSnippetProps {
    filename: string,
    data: string;
}

export function McaComponentSnippet(props: McaComponentSnippetProps) {
    const { filename, data } = props;
    const alertApi = useApi(alertApiRef);
    const errorApi = useApi(errorApiRef);
    const [{ error }, copyToClipboard] = useCopyToClipboard();

    useEffect(() => {
        if (error) {
            errorApi.post(error);
        }
    }, [error, errorApi]);

    const handleCopyClick: MouseEventHandler = e => {
        e.stopPropagation();
        copyToClipboard(data);
        alertApi.post({ message: 'Copied to clipboard!', severity: 'success' });
    };

    const handleDownloadClick: MouseEventHandler = e => {
        e.stopPropagation();
        const blob = new Blob([data], {
            type: 'application/xml',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}`;
        a.click();

        window.URL.revokeObjectURL(url);
    };

    return (
        <Box position="relative">
            <LightAsync
                language="xml"
                style={docco}
            >
                {data}
            </LightAsync>
            <Flex style={{ gap: '4px', padding: '4px', position: 'absolute', top: '0px', right: '0px' }}>
                <ButtonIcon
                    variant="tertiary"
                    size="medium"
                    onClick={handleCopyClick}
                    icon={<RiFileCopy2Line style={{ width: '2em', height: '2em' }} />}
                    aria-label="Copy XML to clipboard"
                />
                <ButtonIcon
                    variant="tertiary"
                    size="medium"
                    onClick={handleDownloadClick}
                    icon={<RiFileDownloadFill style={{ width: '2em', height: '2em' }} />}
                    aria-label="Download XML"
                />
            </Flex>
        </Box>
    );
}