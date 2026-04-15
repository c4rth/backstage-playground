import { Content } from "@backstage/core-components";
import { defaultTools } from "./tools";
import { useCallback, useState } from "react";
import { Tool } from "./types";
import { ToolContainer } from "./ToolContainer";
import { Grid, List, ListRow } from "@backstage/ui";
import { useAnalytics } from '@backstage/core-plugin-api';
import styles from './ToolsContainer.module.css';

export const ToolsContainer = () => {

    const tools = defaultTools;
    const analytics = useAnalytics();

    const [selectedTool, setSelectedTool] = useState<Tool>(tools[0]);

    const handleSelectedChange = useCallback((toolId: string) => {
        setSelectedTool(defaultTools.find(tool => tool.id === toolId) ?? tools[0]);
        analytics.captureEvent('navigate', `/tools/${toolId}`);
    }, [tools, analytics]);

    return (
        <Content noPadding>
            <Grid.Root style={{ width: '100%', height: '100%' }} gap='0'>
                <Grid.Item
                    colSpan='2'
                >
                    <List
                        aria-label="Tools"
                        selectedKeys={[selectedTool.id]}
                        selectionMode="single"
                        onSelectionChange={(keys) => {
                            const key = Array.from(keys)[0] as string;
                            if (key) handleSelectedChange(key);
                        }}
                        className={styles.customList}
                    >
                        {tools.map(tool => (
                            <ListRow
                                key={tool.id}
                                id={tool.id}
                                textValue={tool.name}
                                description={tool.description}
                                className={styles.customList}
                            >
                                <strong>{tool.name}</strong>
                            </ListRow>
                        ))}
                    </List>
                </Grid.Item>

                <Grid.Item colSpan='10' style={{ padding: 0 }}>
                    <ToolContainer tool={selectedTool} />
                </Grid.Item>
            </Grid.Root>
        </Content >
    );
}