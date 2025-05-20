
export type DbMcaRow = {
  component: string;
  type: string;
  prd_version: string;
  p1_version: string;
  p2_version: string;
  p3_version: string;
  p4_version: string;
  application_code: string;
  package_name: string;
};

export type DbVersionsRow = {
  version: string;
  p1_version: string;
  p2_version: string;
  p3_version: string;
  p4_version: string;
};

export type DbBaseTypeRow = {
  base_type: string;
  package_name: string;
};