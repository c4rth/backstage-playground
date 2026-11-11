import { ComponentChip } from '../common';
import { ServiceDefinition } from '@internal/plugin-api-platform-common';
import { Flex, ColumnConfig, Column, Text, FullPage } from '@backstage/ui';
import { useDocumentTitle } from '@internal/plugin-components-react';
import {
  BaseServiceTable,
  BaseTableRow,
  buildColumns,
  renderVersionList,
} from '../ServiceTable';
import { RiCloseCircleLine } from '@remixicon/react';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { apiPlatformTranslationRef } from '../../translation';

type TableRow = BaseTableRow;

const toRow = (
  serviceDefinition: ServiceDefinition,
  idx: number,
): TableRow => ({
  id: idx,
  name: serviceDefinition.name,
  system: serviceDefinition.system,
  serviceDefinition,
});

const createEnvironmentColumn = (env: string): ColumnConfig<TableRow> => ({
  id: env,
  label: env.toUpperCase(),
  width: '12%',
  isSortable: false,
  header: () => (
    <Column id={env} className="centered-col-header">
      <Text weight="bold">{env.toUpperCase()}</Text>
    </Column>
  ),
  cell: ({ serviceDefinition }) =>
    renderVersionList(serviceDefinition, version => {
      const envData = version.environments[
        env as keyof typeof version.environments
      ] as any;
      const dependencies = envData?.dependencies || [];
      if (!envData) {
        return <div />;
      }
      if (!dependencies.length) {
        return <RiCloseCircleLine size="20" />;
      }
      return (
        <Flex direction="column" align="center" gap="0.5">
          {dependencies.map((dep: string, i: number) => (
            <ComponentChip key={dep} index={i} text={dep} />
          ))}
        </Flex>
      );
    }),
});

const ENV_COLUMNS: ColumnConfig<TableRow>[] = [
  createEnvironmentColumn('tst'),
  createEnvironmentColumn('gtu'),
  createEnvironmentColumn('uat'),
  createEnvironmentColumn('ptp'),
  createEnvironmentColumn('prd'),
];

export const LibraryByServiceTable = () => {
  const { t } = useTranslationRef(apiPlatformTranslationRef);
  useDocumentTitle(t('libraryTable.byServiceDocumentTitle'));
  return (
    <FullPage>
      <BaseServiceTable<TableRow>
        columns={buildColumns<TableRow>(ENV_COLUMNS, t)}
        toRow={toRow}
        toggleType="dependents"
        storageOwnershipKey="serviceLibrariesTablePageOwner"
        storageSearchKey="serviceLibrariesTablePageSearch"
      />
    </FullPage>
  );
};
