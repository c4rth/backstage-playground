import { McaComponent, McaComponentListFields, McaComponentListResult, McaComponentType, McaVersions } from "@internal/plugin-mca-components-common";

export type McaComponentOrderByOptions = {
    field: McaComponentListFields;
    direction: 'asc' | 'desc';
};

export type McaComponentListRequest = {
    offset?: number,
    limit?: number,
    orderBy?: McaComponentOrderByOptions,
    search?: string,
    type: McaComponentType
};

export interface McaService {

    getMcaComponentsCount(request: { type: McaComponentType }): Promise<number>;

    listMcaComponents(request: McaComponentListRequest): Promise<McaComponentListResult>

    getMcaComponent(request: { component: string }): Promise<McaComponent | undefined>

    getMcaVersions(): Promise<McaVersions>;
}
