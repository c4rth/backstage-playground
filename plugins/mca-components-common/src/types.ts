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

export type McaVersions = {
  p1Version: string;
  p2Version: string;
  p3Version: string;
  p4Version: string;
};

export type McaBaseType = {
  baseType: string;
  packageName: string;
};

export type McaBaseTypeListFields =
  | 'baseType'
  | 'packageName';


export const MCABASETYPE_FIELDS = [
  'baseType',
  'packageName'] as const;

export type McaBaseTypeListOptions = {
  offset?: number;
  limit?: number;
  orderBy?: {
    field: McaBaseTypeListFields;
    direction: 'asc' | 'desc';
  };
  search?: string;
};

export type McaBaseTypeListResult = {
  items: McaBaseType[];
  offset: number;
  limit: number;
};