import { Content } from "@backstage/core-components";
import {  Grid, List, ListItem } from "@material-ui/core";
import { defaultTools } from "./tools";
import { useCallback, useState } from "react";
import { Tool } from "./types";
import { ToolContainer } from "./ToolContainer";

export const ToolsContainer = () => {

    const tools = defaultTools;

    const [selectedTool, setSelectedTool] = useState<Tool>(tools[0]);

    const handleSelectedChange = useCallback((toolId: string) => {
        setSelectedTool(defaultTools.find(tool => tool.id === toolId) ?? tools[0]);
    }, [tools]);

    return (
        <Content noPadding>
            <Grid
                container
                spacing={2}
                direction="row"
                style={{ margin: 0, width: '100%', padding: 0, height: '100%' }}
            >
                <Grid
                    item
                    xs={4}
                    md={3}
                    lg={2}
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
                                onClick={() => handleSelectedChange(tool.id)}
                                style={{ padding: '0 !important' }}>
                                <Grid
                                    container
                                    direction="row"
                                    alignItems="center"
                                    style={{ padding: '8px', cursor: 'pointer' }}>
                                    <Grid item xs>
                                        <strong>{tool.name}</strong>
                                        <div>{tool.description}</div>
                                    </Grid>
                                </Grid>
                            </ListItem>
                        ))}
                    </List>
                </Grid>

                <Grid item xs={8} md={9} lg={10} style={{ padding: 0 }}>
                    <ToolContainer tool={selectedTool} />
                </Grid>
            </Grid>
        </Content >
    );
}