import { Tool } from './types';

export interface ToolContainerProps {
    tool: Tool;
}

export const ToolContainer = (props: ToolContainerProps) => {
    const { tool } = props;

    return (
        <div style={{
            padding: '1rem',
            width: '100%',
            height: '100%',
            overflow: 'auto',
        }}>
            {tool.headerButtons}
            {tool.component}
        </div>
    );
};