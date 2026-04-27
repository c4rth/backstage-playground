import { Table, TableColumn, Link } from '@backstage/core-components';
import { ButtonIcon, Flex, Tooltip, TooltipTrigger } from '@backstage/ui';
import { RiAsterisk } from '@remixicon/react';
import { memo } from 'react';

type FieldInfo = {
  kind: 'component' | 'basetype' | 'unknown';
  name: string;
  clientElement?: string;
  clientKind?: 'components' | 'basetypes';
};

type TableRow = {
  id: number;
  name: string;
  className: string;
  elementType: string;
  description: string;
  mandatory: boolean;
  field: FieldInfo;
};

function getElementKind(className?: string, elementType?: string): FieldInfo {
  if (!className) {
    return { kind: 'unknown', name: '???' };
  }
  if (className.startsWith('dexia.gemk.operationlayer.client.')) {
    const classShort = className.split('.').pop();
    const element = elementType?.split('.').pop();
    const clientKind = elementType?.startsWith('dexia.opmk.basetypes')
      ? 'basetypes'
      : 'components';
    return {
      kind: 'component',
      clientElement: classShort,
      clientKind,
      name: element || '',
    };
  }
  if (className.startsWith('dexia.opmk.operation')) {
    return { kind: 'component', name: className.split('.').pop() || '' };
  }
  if (className.startsWith('dexia.opmk.basetypes')) {
    return { kind: 'basetype', name: className.split('.').pop() || '' };
  }
  return { kind: 'unknown', name: className };
}

const ClassNameRenderer = memo<{ row: TableRow }>(({ row }) => {
  const { field } = row;

  if (field.kind === 'component') {
    if (field.clientElement) {
      return (
        <div>
          {field.clientElement} of{' '}
          {field.name && (
            <Link to={`/mca/${field.clientKind}/${field.name}`}>
              <b>{field.name}</b>
            </Link>
          )}
        </div>
      );
    }
    return (
      <Link to={`/mca/components/${field.name}`}>
        <b>{field.name}</b>
      </Link>
    );
  }

  if (field.kind === 'basetype') {
    return (
      <Link to={`/mca/basetypes/${field.name}`}>
        <b>{field.name}</b>
      </Link>
    );
  }

  return <div>{field.name}</div>;
});

const mandatoryColumn: TableColumn<TableRow> = {
  title: '',
  width: '1%',
  field: 'mandatory',
  render: ({ mandatory }) =>
    mandatory ? (
      <TooltipTrigger delay={250}>
        <ButtonIcon
          variant="tertiary"
          size="small"
          style={{ width: 'auto', background: 'transparent' }}
          icon={<RiAsterisk color="primary" />}
        />
        <Tooltip placement="bottom">Mandatory</Tooltip>
      </TooltipTrigger>
    ) : null,
};

const commonColumns: TableColumn<TableRow>[] = [
  {
    title: 'Name',
    width: '20%',
    field: 'name',
    highlight: true,
  },
  {
    title: 'Class',
    width: '25%',
    searchable: true,
    customFilterAndSearch: (query, row) =>
      `${row.className} ${row.elementType}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    render: rowData => <ClassNameRenderer row={rowData} />,
  },
  {
    title: 'Description',
    width: '55%',
    field: 'description',
    render: ({ description }) => (
      <div
        style={{ whiteSpace: 'pre-wrap' }}
        dangerouslySetInnerHTML={{ __html: description }}
      />
    ),
  },
];

function toTableRows(
  fields: any,
  fieldType: 'element' | 'input' | 'output',
): TableRow[] {
  if (!fields) return [];

  // Output fields have a different structure
  if (fieldType === 'output') {
    if (Array.isArray(fields)) {
      return fields.map((item: any, index: number) => ({
        id: index,
        name: item.name,
        className: item.className,
        description: item.description,
        mandatory: item.mandatory,
        elementType: item.elementType,
        field: getElementKind(item.className, item.elementType),
      }));
    }
    return [
      {
        id: 0,
        name: fields.name,
        className: fields.className,
        description: fields.description,
        mandatory: fields.mandatory,
        elementType: fields.elementType,
        field: getElementKind(fields.className, fields.elementType),
      },
    ];
  }

  // Element and input fields have the same structure with nested field property
  if (Array.isArray(fields)) {
    return fields.map((item: any, index: number) => ({
      id: index,
      name: item.field.name,
      className: item.field.className,
      elementType: item.field.elementType,
      description: item.field.description,
      mandatory: item.mandatory,
      field: getElementKind(item.field.className, item.field.elementType),
    }));
  }

  if (fields.field) {
    return [
      {
        id: 0,
        name: fields.field.name,
        className: fields.field.className,
        elementType: fields.field.elementType,
        description: fields.field.description,
        mandatory: fields.mandatory,
        field: getElementKind(fields.field.className, fields.field.elementType),
      },
    ];
  }

  return [];
}

export interface McaComponentFieldsCardProps {
  data: any;
  fieldType: 'element' | 'input' | 'output';
  title?: string;
}

const tableOptions = {
  search: true,
  padding: 'dense' as const,
  paging: false,
  draggable: false,
  thirdSortClick: true,
  showEmptyDataSourceMessage: true,
};

function getFields(data: any, fieldType: 'element' | 'input' | 'output') {
  if (fieldType === 'element') return data?.fields?.FieldInput;
  if (fieldType === 'input') return data?.inputFields?.FieldInput;
  return data?.outputFields?.field;
}

function getColumns(fieldType: 'element' | 'input' | 'output') {
  if (fieldType === 'input') return [mandatoryColumn, ...commonColumns];
  return commonColumns;
}

function getDefaultTitle(fieldType: 'element' | 'input' | 'output') {
  if (fieldType === 'element') return 'Fields';
  if (fieldType === 'input') return 'Input Fields';
  return 'Output Fields';
}

export const McaComponentFieldsCard = memo<McaComponentFieldsCardProps>(
  ({ data, fieldType, title }) => {
    const fields = getFields(data, fieldType);
    const rows = toTableRows(fields, fieldType);
    const columns = getColumns(fieldType);
    const defaultTitle = getDefaultTitle(fieldType);
    const tableTitle = (
      <Flex align="center">
        {title || defaultTitle} ({rows.length})
      </Flex>
    );

    return (
      <Table<TableRow>
        columns={columns}
        options={tableOptions}
        title={tableTitle}
        data={rows}
      />
    );
  },
);
