import { Table, TableColumn, Link, StatusOK, StatusAborted } from "@backstage/core-components";
import { Box } from "@material-ui/core";

export interface McaOperationFieldsCardProps {
  operation: any;
  operationType: "atomic" | "list";
  fieldType: "input" | "output";
}

type TableRow = {
  id: number;
  name: string;
  className: string;
  elementType: string;
  description: string;
  mandatory: boolean;
};

const getClassName = (row: TableRow) => {
  const { className, elementType } = row;
  if (className?.startsWith("dexia.gemk.operationlayer.client.")) {
    const classShort = className.split(".").pop();
    const element = elementType?.split(".").pop();
    return (
      <div>
        {classShort} of {element && (
          <Link to={`/mca/components/${element}`}><b>{element}</b></Link>
        )}
      </div>
    );
  }
  if (className?.startsWith("dexia.opmk.operation")) {
    const element = className.split(".").pop();
    return (
      <Link to={`/mca/components/${element}`}><b>{element}</b></Link>
    );
  }
  if (className?.startsWith("dexia.opmk.basetypes")) {
    const element = className.split(".").pop();
    return (
      <Link to={`/mca/basetypes/${element}`}><b>{element}</b></Link>
    );
  }
  return <div>{className}</div>;
};

const inputColumns: TableColumn<TableRow>[] = [
  {
    title: "Name",
    width: "20%",
    field: "name",
    defaultSort: "asc",
    highlight: true,
    render: ({ name }) => <div>{name}</div>,
  },
  {
    title: "Class",
    width: "25%",
    searchable: true,
    customFilterAndSearch: (query, row) =>
      `${row.className} ${row.elementType}`.toLowerCase().includes(query.toLowerCase()),
    render: getClassName,
  },
  {
    title: "Description",
    width: "48%",
    field: "description",
    render: ({ description }) => <div>{description}</div>,
  },
  {
    title: "Mandatory",
    width: "7%",
    field: "mandatory",
    render: ({ mandatory }) => (mandatory ? <StatusOK /> : <StatusAborted />),
  },
];

const outputColumns: TableColumn<TableRow>[] = [
  {
    title: "Name",
    width: "20%",
    field: "name",
    defaultSort: "asc",
    highlight: true,
    render: ({ name }) => <div>{name}</div>,
  },
  {
    title: "Class",
    width: "25%",
    searchable: true,
    customFilterAndSearch: (query, row) =>
      `${row.className} ${row.elementType}`.toLowerCase().includes(query.toLowerCase()),
    render: getClassName,
  },
  {
    title: "Description",
    width: "55%",
    field: "description",
    highlight: false,
    render: ({ description }) => <div>{description}</div>,
  },
];

export const McaOperationFieldsCard = ({ operation, fieldType }: McaOperationFieldsCardProps) => {
  const inputFieldRows = toInputTableRows(operation.inputFields.FieldInput);
  const outputFieldRows = toOutputTableRows(operation.outputFields.field);

  const columns = fieldType === "input" ? inputColumns : outputColumns;
  const data = fieldType === "input" ? inputFieldRows : outputFieldRows;
  const title = (
    <Box display="flex" alignItems="center">
      <Box mr={1} />
      {fieldType === "input" ? "Input Fields" : "Output Fields"}
    </Box>
  );

  return (
    <Table<TableRow>
      columns={columns}
      options={{
        search: true,
        padding: "dense",
        paging: false,
        draggable: false,
        thirdSortClick: false,
      }}
      title={title}
      data={data}
    />
  );
};

function toInputTableRows(fields: any): TableRow[] {
  if (!fields) return [];
  if (Array.isArray(fields)) {
    return fields.map((item: any, index: number) => ({
      id: index,
      name: item.field.name,
      className: item.field.className,
      description: item.field.description,
      mandatory: item.mandatory,
      elementType: item.field.elementType,
    }));
  }
  return [
    {
      id: 0,
      name: fields.field.name,
      className: fields.field.className,
      description: fields.field.description,
      mandatory: fields.mandatory,
      elementType: fields.field.elementType,
    },
  ];
}

function toOutputTableRows(fields: any): TableRow[] {
  if (!fields) return [];
  if (Array.isArray(fields)) {
    return fields.map((item: any, index: number) => ({
      id: index,
      name: item.name,
      className: item.className,
      description: item.description,
      mandatory: item.mandatory,
      elementType: item.elementType,
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
    },
  ];
}