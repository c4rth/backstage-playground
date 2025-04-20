import { Table, TableColumn, Link } from "@backstage/core-components";
import { Box } from "@material-ui/core";

export interface McaOperationFieldsCardProps {
    operation: any;
    operationType: 'atomic' | 'list';
}

type TableRow = {
    id: number,
    name: string,
    className: string,
    description: string,
    mandatory: boolean,
    elementType: string,
}

const inputColumns: TableColumn<TableRow>[] = [
    {
        title: 'Name',
        width: '25%',
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
        field: 'className',
        render: (row) => {
            if (row.className && row.className.startsWith('dexia.opmk.operation')) {
                const element = row.className.split('.').pop();
                return (
                    <Link to={`/mca-components/components/${element}`}><b>{element}</b></Link>
                );
            }
            return (
                <div>{row.className}</div>
            );
        },
    },
    {
        title: 'Description',
        width: '40%',
        field: 'description',
        render: (row) => {
            return (
                <div>{row.description}</div>
            );
        },
    },
    {
        title: 'Mandatory',
        width: '5%',
        field: 'mandatory',
        render: (row) => {
            return (
                <div>{row.mandatory ? 'Y' : 'N'}</div>
            );
        },
    },
];


const outputColumns: TableColumn<TableRow>[] = [
    {
        title: 'Name',
        width: '25%',
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
        field: 'className',
        highlight: false,
        render: (row) => {
            return (
                <div>{row.className}</div>
            );
        },
    },
    {
        title: 'Element Type',
        width: '20%',
        field: 'elementType',
        render: (row) => {
            if (row.elementType && row.elementType.startsWith('dexia.opmk.operation')) {
                const element = row.elementType.split('.').pop();
                return (
                    <Link to={`/mca-components/components/${element}`}><b>{element}</b></Link>
                );
            }
            return (
                <div>{row.elementType}</div>
            );
        },
    },
    {
        title: 'Description',
        width: '30%',
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
    const { operation } = props;
    const inputFieldRows = toInputTableRows(operation.inputFields.FieldInput);
    const outputFieldRows = toOutputTableRows(operation.outputFields.field);


    return (
        <>
            <Table<TableRow>
                columns={inputColumns}
                options={{
                    search: true,
                    padding: 'dense',
                    paging: false,
                    draggable: false,

                }}
                title={
                    <Box display="flex" alignItems="center">
                        <Box mr={1} />
                        Input Fields
                    </Box>
                }
                data={inputFieldRows}
            />
            <
                Table<TableRow>
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
        </>
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