import { Table, TableColumn } from "@backstage/core-components";
import { Box } from "@material-ui/core";

export interface McaElementFieldsCardProps {
    element: any;
}

type TableRow = {
    id: number,
    name: string,
    className: string,
    description: string,
    mandatory: boolean,
}

const columns: TableColumn<TableRow>[] = [
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
        title: 'Description',
        width: '40%',
        field: 'description',
        highlight: false,
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
        highlight: true,
        render: (row) => {
            return (
                <div>{row.mandatory ? 'Y' : 'N'}</div>
            );
        },
    },
];

export const McaElementFieldsCard = (props: McaElementFieldsCardProps) => {
    const { element } = props;

    const rows = toTableRows(element.fields.FieldInput);

    return (
        <Table<TableRow>
            columns={columns}
            options={{
                search: true,
                padding: 'dense',
                paging: false,
                draggable: false,

            }}
            title={
                <Box display="flex" alignItems="center">
                    <Box mr={1} />
                    Fields
                </Box>
            }
            data={rows}
        />
    );
}

function toTableRows(
    fields: any,
): TableRow[] {
    if (Array.isArray(fields)) {
        return fields.map((item: any, index: number) => ({
            id: index,
            name: item.field.name,
            className: item.field.className,
            description: item.field.description,
            mandatory: item.mandatory,
        }));
    }
    return [
        {
            id: 0,
            name: fields.field.name,
            className: fields.field.className,
            description: fields.field.description,
            mandatory: fields.mandatory,
        },
    ];
}