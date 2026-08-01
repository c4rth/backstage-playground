import type {} from 'react-syntax-highlighter';
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';
import docco from 'react-syntax-highlighter/dist/esm/styles/hljs/docco';
import { Box, ButtonIcon, Flex, Tooltip, TooltipTrigger } from '@backstage/ui';
import { RiFileCopy2Line, RiFileDownloadFill } from '@remixicon/react';
import { MouseEventHandler, Suspense, lazy, useEffect } from 'react';
import { errorApiRef, useApi } from '@backstage/core-plugin-api';
import useCopyToClipboard from 'react-use/esm/useCopyToClipboard';
import { toastApiRef } from '@backstage/frontend-plugin-api';
import { Progress } from '@internal/plugin-api-platform-react';

const LightAsync = lazy(async () => {
  const module = await import('react-syntax-highlighter/dist/esm/light-async');
  return {
    default: module.default as React.ComponentType<SyntaxHighlighterProps>,
  };
});

export interface McaComponentSnippetProps {
  filename: string;
  data: string;
}

export function McaComponentSnippet(props: McaComponentSnippetProps) {
  const { filename, data } = props;
  const toastApi = useApi(toastApiRef);
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
    toastApi.post({
      title: 'Copied to clipboard!',
      status: 'success',
      timeout: 2000,
    });
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
      <Suspense
        fallback={
          <Box
            py="4"
            style={{ display: 'flex', justifyContent: 'center' }}
            aria-busy
          >
            <Progress />
          </Box>
        }
      >
        <LightAsync language="xml" style={docco}>
          {data}
        </LightAsync>
      </Suspense>
      <Flex
        style={{
          gap: '4px',
          padding: '4px',
          position: 'absolute',
          top: '0px',
          right: '0px',
        }}
      >
        <TooltipTrigger trigger="hover" delay={500}>
          <ButtonIcon
            variant="primary"
            size="medium"
            onClick={handleCopyClick}
            icon={
              <RiFileCopy2Line style={{ width: '1.5em', height: '1.5em' }} />
            }
            aria-label="Copy XML to clipboard"
          />
          <Tooltip placement="bottom" style={{ maxWidth: '50rem' }}>
            Copy XML to clipboard
          </Tooltip>
        </TooltipTrigger>
        <TooltipTrigger trigger="hover" delay={500}>
          <ButtonIcon
            variant="primary"
            size="medium"
            onClick={handleDownloadClick}
            icon={
              <RiFileDownloadFill style={{ width: '1.5em', height: '1.5em' }} />
            }
            aria-label="Download XML"
          />
          <Tooltip placement="bottom" style={{ maxWidth: '50rem' }}>
            Download XML
          </Tooltip>
        </TooltipTrigger>
      </Flex>
    </Box>
  );
}
