import { Suspense } from 'react';
import { Box, CircularProgress, styled } from '@material-ui/core';
import { Tool } from './types';

const StyledToolContainer = styled('div')(({ theme }) => ({
    padding: '1rem',
    width: '100%',
    height: '100%',
    overflow: 'auto',
    backgroundColor: theme.palette.background.default,
}));

export interface ToolContainerProps {
    tool: Tool;
}

export const ToolContainer = (props: ToolContainerProps) => {
    const { tool } = props;

    return (
        <StyledToolContainer>
            <Suspense
                fallback={
                    <Box
                        display="flex"
                        width="100%"
                        height="50%"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <CircularProgress />
                    </Box>
                }
            >
                {tool.headerButtons}
                {tool.component}
            </Suspense>
        </StyledToolContainer>
    );
};