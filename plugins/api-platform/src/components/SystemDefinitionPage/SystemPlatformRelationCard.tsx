import { Link, Table, TableColumn } from '@backstage/core-components';
import { Flex } from '@backstage/ui';
import { ComponentDisplayName } from '../common';

type TableRow = {
  id: number;
  name: string;
  system: string;
};

const apiColumns: TableColumn<TableRow>[] = [
  {
    title: 'Name',
    width: '100%',
    field: 'name',
    highlight: true,
    defaultSort: 'asc',
    render: ({ name, system }: TableRow) => (
      <Link to={`/api-platform/api/${system}/${name}`}>
        <ComponentDisplayName type="api" text={name} />
      </Link>
    ),
  },
];

const serviceColumns: TableColumn<TableRow>[] = [
  {
    title: 'Name',
    width: '100%',
    field: 'name',
    highlight: true,
    defaultSort: 'asc',
    render: ({ name, system }: TableRow) => (
      <Link to={`/api-platform/service/${system}/${name}`}>
        <ComponentDisplayName type="service" text={name} />
      </Link>
    ),
  },
];

const libraryColumns: TableColumn<TableRow>[] = [
  {
    title: 'Name',
    width: '100%',
    field: 'name',
    highlight: true,
    defaultSort: 'asc',
    render: ({ name, system }: TableRow) => (
      <Link to={`/api-platform/library/${system}/${name}`}>
        <ComponentDisplayName type="library" text={name} />
      </Link>
    ),
  },
];

const DEFAULT_PAGE_SIZE = 20;

const toRow = (item: string, idx: number, system: string): TableRow => ({
  id: idx,
  name: item,
  system,
});

interface SystemPlatformRelationCardProps {
  system: string;
  dependency: 'api' | 'service' | 'library';
  data: string[];
}

export const SystemRelationCard = ({
  system,
  dependency,
  data,
}: SystemPlatformRelationCardProps) => {
  let columns: TableColumn<TableRow>[];
  let title: string;

  if (dependency === 'api') {
    columns = apiColumns;
    title = 'APIs';
  } else if (dependency === 'library') {
    columns = libraryColumns;
    title = 'Libraries';
  } else {
    columns = serviceColumns;
    title = 'Services';
  }

  const rows = data.map((item, idx) => toRow(item, idx, system));
  const showPagination = rows.length > DEFAULT_PAGE_SIZE;

  return (
    <Table<TableRow>
      columns={columns}
      options={{
        search: false,
        padding: 'dense' as const,
        paging: showPagination,
        pageSize: DEFAULT_PAGE_SIZE,
        draggable: false,
        thirdSortClick: false,
      }}
      title={
        <Flex align="center">
          {title} ({rows.length})
        </Flex>
      }
      data={rows}
    />
  );
};
