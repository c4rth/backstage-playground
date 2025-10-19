import { Content } from "@backstage/core-components";
import { defaultTools } from "./tools";
import { useCallback, useState } from "react";
import { Tool } from "./types";
import { ToolContainer } from "./ToolContainer";
import { Grid } from "@backstage/ui";

// TODO-MUI
import { List, ListItem } from "@material-ui/core";

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
                    <List>
                        {tools.map(tool => (
                            <ListItem
                                selected={selectedTool.id === tool.id}
                                key={tool.id}
                                id={tool.id}
                                onClick={() => handleSelectedChange(tool.id)}
                                style={{ padding: '0 !important' }}>
                                <Grid.Root
                                    style={{ padding: '8px', cursor: 'pointer' }}>
                                    <Grid.Item>
                                        <strong>{tool.name}</strong>
                                        <div>{tool.description}</div>
                                    </Grid.Item>
                                </Grid.Root>
                            </ListItem>
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