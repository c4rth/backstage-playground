import { Tool } from '@backstage/plugin-home';

export type ToolkitLink = Tool & { iconUrl: string };
export type CategoryData = Record<string, ToolkitLink[]>;
