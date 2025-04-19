export type McaComponent = {
  component: string;
  prdVersion: string;
  p1Version: string;
  p2Version: string;
  p3Version: string;
  p4Version: string;
  applicationCode: string;
  packageName: string;
};

export type McaComponentListResult = {
  items: McaComponent[];
  offset: number;
  limit: number;
};

export type McaComponentListFields =
  | 'component'
  | 'prdVersion'
  | 'p1Version'
  | 'p2Version'
  | 'p3Version'
  | 'p4Version'
  | 'applicationCode'
  | 'packageName';

export const MCACOMPONENT_FIELDS = [
  'component',
  'prdVersion',
  'p1Version',
  'p2Version',
  'p3Version',
  'p4Version',
  'applicationCode',
  'packageName'] as const;

export type McaComponentListOptions = {
  offset?: number;
  limit?: number;
  orderBy?: {
    field: McaComponentListFields;
    direction: 'asc' | 'desc';
  };
  search?: string;
  type: McaComponentType;
};

export type McaComponentType = 'element' | 'operation' | 'all';