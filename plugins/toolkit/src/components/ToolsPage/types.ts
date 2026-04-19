import { ReactElement } from 'react';

export type Tool = {
  id: string;
  name: string;
  component: ReactElement;
  aliases?: string[];
  description?: string;
  category?: string;
  headerButtons?: ReactElement[];
};
