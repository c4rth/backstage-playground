import {
  ButtonIcon,
  Tooltip,
  TooltipTrigger,
  Link,
  Text,
  Table,
  useTable,
  ColumnConfig,
  Cell,
  Container,
  Header,
  SearchField,
  Box,
} from '@backstage/ui';
import { RiAsterisk } from '@remixicon/react';
import { memo } from 'react';
import styles from './McaComponentTable.module.css';

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
            <Link
              href={`/mca/${field.clientKind}/${field.name}`}
              weight="bold"
              color="info"
              standalone
            >
              <b>{field.name}</b>
            </Link>
          )}
        </div>
      );
    }
    return (
      <Link
        href={`/mca/components/${field.name}`}
        weight="bold"
        color="info"
        standalone
      >
        <b>{field.name}</b>
      </Link>
    );
  }

  if (field.kind === 'basetype') {
    return (
      <Link
        href={`/mca/basetypes/${field.name}`}
        weight="bold"
        color="info"
        standalone
      >
        <b>{field.name}</b>
      </Link>
    );
  }

  return <div>{field.name}</div>;
});

const mandatoryColumn: ColumnConfig<TableRow> = {
  label: '',
  width: '1%',
  id: 'mandatory',
  cell: ({ mandatory }) =>
    mandatory ? (
      <Cell>
        <TooltipTrigger delay={250}>
          <ButtonIcon
            variant="tertiary"
            size="small"
            style={{ width: 'auto', background: 'transparent' }}
            icon={<RiAsterisk color="primary" />}
          />
          <Tooltip placement="bottom">Mandatory</Tooltip>
        </TooltipTrigger>
      </Cell>
    ) : (
      <Cell />
    ),
};

const commonColumns: ColumnConfig<TableRow>[] = [
  {
    label: 'Name',
    width: '20%',
    id: 'name',
    isRowHeader: true,
    cell: row => (
      <Cell>
        <Text weight="bold">{row.name}</Text>
      </Cell>
    ),
  },
  {
    label: 'Class',
    width: '25%',
    id: 'className',
    cell: rowData => (
      <Cell>
        <ClassNameRenderer row={rowData} />
      </Cell>
    ),
  },
  {
    label: 'Description',
    width: '55%',
    id: 'description',
    cell: ({ description }) => (
      <Cell>
        <div
          style={{ whiteSpace: 'pre-wrap' }}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </Cell>
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

export interface McaComponentFieldsTabProps {
  data: any;
  fieldType: 'element' | 'input' | 'output';
  title?: string;
}

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

export const McaComponentFieldsTab = memo<McaComponentFieldsTabProps>(
  ({ data, fieldType, title }) => {
    const fields = getFields(data, fieldType);
    const rows = toTableRows(fields, fieldType);
    const columns = getColumns(fieldType);
    const defaultTitle = getDefaultTitle(fieldType);

    const { tableProps, search } = useTable({
      mode: 'complete',
      getData: () => rows,
      searchFn: (items, query) => {
        const lowerQuery = query.toLowerCase();
        return items.filter(
          item =>
            item.name.toLowerCase().includes(lowerQuery) ||
            item.field.name.toLowerCase().includes(lowerQuery) ||
            item.description.toLowerCase().includes(lowerQuery),
        );
      },
    });

    return (
      <Container>
        <Header
          title={`${title || defaultTitle} (${rows.length})`}
          customActions={
            <Box style={{ marginLeft: 'auto', width: '250px' }}>
              <SearchField
                placeholder="Filter..."
                value={search.value}
                onChange={str => {
                  search.onChange(str);
                }}
                aria-label="Filter"
              />
            </Box>
          }
        />
        <Table
          key={`table-${fieldType}`}
          {...tableProps}
          columnConfig={columns}
          emptyState={<div>No fields found for this {fieldType}.</div>}
          className={styles.denseTable}
        />
      </Container>
    );
  },
);
