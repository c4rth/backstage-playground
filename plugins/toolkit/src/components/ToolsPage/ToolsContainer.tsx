import { Content } from "@backstage/core-components";
import { defaultTools } from "./tools";
import { useCallback, useState } from "react";
import { Tool } from "./types";
import { ToolContainer } from "./ToolContainer";
import { Grid } from "@backstage/ui";
import { ListBox, ListBoxItem } from "react-aria-components";

export const ToolsContainer = () => {

    const tools = defaultTools;

    const [selectedTool, setSelectedTool] = useState<Tool>(tools[0]);

    const handleSelectedChange = useCallback((toolId: string) => {
        setSelectedTool(defaultTools.find(tool => tool.id === toolId) ?? tools[0]);
    }, [tools]);

    return (
        <Content noPadding>
            <Grid.Root style={{ width: '100%', height: '100%'}}>
                <Grid.Item
                    colSpan='2'
                    style={{
                        borderRight: '1px solid #FF0000',
                        padding: '0 !important',
                    }}
                >
                    <ListBox
                        aria-label="Tools"
                        selectedKeys={[selectedTool.id]}
                        selectionMode="single"
                        onSelectionChange={(keys) => {
                            const key = Array.from(keys)[0] as string;
                            if (key) handleSelectedChange(key);
                        }}
                    >
                        {tools.map(tool => (
                            <ListBoxItem
                                key={tool.id}
                                id={tool.id}
                                textValue={tool.name}
                                style={({ isSelected }) => ({ 
                                    padding: '10px',
                                    backgroundColor: isSelected ? 'var(--bui-gray-3 )' : 'transparent',
                                })}
                            >
                                <Grid.Root
                                    style={{ padding: '8px', cursor: 'pointer' }}>
                                    <Grid.Item>
                                        <strong>{tool.name}</strong>
                                        <div>{tool.description}</div>
                                    </Grid.Item>
                                </Grid.Root>
                            </ListBoxItem>
                        ))}
                    </ListBox>
                </Grid.Item>

                <Grid.Item colSpan='10' style={{ padding: 0 }}>
                    <ToolContainer tool={selectedTool} />
                </Grid.Item>
            </Grid.Root>
        </Content >
    );
}