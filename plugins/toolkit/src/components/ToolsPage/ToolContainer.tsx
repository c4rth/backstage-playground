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
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
        }}>
            {tool.headerButtons}
            <div style={{ flex: 1, minHeight: 0 }}>
                {tool.component}
            </div>
        </div>
    );
};