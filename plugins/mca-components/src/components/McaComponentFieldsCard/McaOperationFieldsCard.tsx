import { Table, TableColumn, Link, StatusOK, StatusAborted } from "@backstage/core-components";
import { Box } from "@material-ui/core";

export interface McaOperationFieldsCardProps {
    operation: any;
    operationType: 'atomic' | 'list';
    fieldType: 'input' | 'output';
}

type TableRow = {
    id: number,
    name: string,
    className: string,
    elementType: string,
    description: string,
    mandatory: boolean,
}

function getClassName(row: TableRow) {
    if (row.className && row.className.startsWith('dexia.gemk.operationlayer.client.')) {
        const className = row.className.split('.').pop();
        const element = row.elementType.split('.').pop();
        return (
            <div>{className} of <Link to={`/mca-components/components/${element}`}><b>{element}</b></Link></div>
        );
    }
    if (row.className && row.className.startsWith('dexia.opmk.operation')) {
        const element = row.className.split('.').pop();
        return (
            <Link to={`/mca-components/components/${element}`}><b>{element}</b></Link>
        );
    }
    if (row.className && row.className.startsWith('dexia.opmk.basetypes')) {
        const element = row.className.split('.').pop();
        return (
            <Link to={`/mca-components/basetypes/${row.className}`}><b>{element}</b></Link>
        );
    }
    return (
        <div>{row.className}</div>
    );
}

const inputColumns: TableColumn<TableRow>[] = [
    {
        title: 'Name',
        width: '20%',
        field: 'name',
        defaultSort: 'asc',
        highlight: true,
        render: (row) => {
            return (
                <div>{row.name}</div>
            );
        },
    },
    {
        title: 'Class',
        width: '25%',
        searchable: true,
        customFilterAndSearch: (query, row) => {
            return `${row.className} ${row.elementType}`.toLowerCase().includes(query.toLowerCase());
        },
        render: (row) => {
            return getClassName(row);
        },
    },
    {
        title: 'Description',
        width: '48%',
        field: 'description',
        render: (row) => {
            return (
                <div>{row.description}</div>
            );
        },
    },
    {
        title: 'Mandatory',
        width: '7%',
        field: 'mandatory',
        render: (row) => {
            return (
                row.mandatory ? <StatusOK /> : <StatusAborted />
            );
        },
    },
];


const outputColumns: TableColumn<TableRow>[] = [
    {
        title: 'Name',
        width: '20%',
        field: 'name',
        defaultSort: 'asc',
        highlight: true,
        render: (row) => {
            return (
                <div>{row.name}</div>
            );
        },
    },
    {
        title: 'Class',
        width: '25%',
        searchable: true,
        customFilterAndSearch: (query, row) => {
            return `${row.className} ${row.elementType}`.toLowerCase().includes(query.toLowerCase());
        },
        render: (row) => {
            return getClassName(row);
        },
    },
    {
        title: 'Description',
        width: '55%',
        field: 'description',
        highlight: false,
        render: (row) => {
            return (
                <div>{row.description}</div>
            );
        },
    },
];

export const McaOperationFieldsCard = (props: McaOperationFieldsCardProps) => {
    const { operation, fieldType } = props;
    const inputFieldRows = toInputTableRows(operation.inputFields.FieldInput);
    const outputFieldRows = toOutputTableRows(operation.outputFields.field);

    if (fieldType === 'input') {
        return (
            <Table<TableRow>
                columns={inputColumns}
                options={{
                    search: true,
                    padding: 'dense',
                    paging: false,
                    draggable: false,
                    thirdSortClick: false,
                }}
                title={
                    <Box display="flex" alignItems="center">
                        <Box mr={1} />
                        Input Fields
                    </Box>
                }
                data={inputFieldRows}
            />
        );
    }
    return (
        <Table<TableRow>
            columns={outputColumns}
            options={{
                search: true,
                padding: 'dense',
                paging: false,
                draggable: false,

            }}
            title={
                <Box display="flex" alignItems="center">
                    <Box mr={1} />
                    Output Fields
                </Box>
            }
            data={outputFieldRows}
        />
    );
}

function toInputTableRows(
    fields: any,
): TableRow[] {
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

function toOutputTableRows(
    fields: any,
): TableRow[] {
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