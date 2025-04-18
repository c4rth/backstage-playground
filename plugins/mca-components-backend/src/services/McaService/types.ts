import { McaComponent, McaComponentListFields, McaComponentListResult } from "@internal/plugin-mca-components-common";

export type McaComponentOrderByOptions = {
    field: McaComponentListFields;
    direction: 'asc' | 'desc';
};

export type McaComponentListRequest = {
    offset?: number,
    limit?: number,
    orderBy?: McaComponentOrderByOptions,
    search?: string
};

export interface McaService {

    getMcaComponentsCount(): Promise<number>;

    listMcaComponents(request: McaComponentListRequest): Promise<McaComponentListResult>

    getMcaComponent(request: { component: string }): Promise<McaComponent | undefined>
}
