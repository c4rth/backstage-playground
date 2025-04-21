import { Table, TableColumn, Link, StatusOK, StatusAborted } from "@backstage/core-components";
import { Box } from "@material-ui/core";

export interface McaElementFieldsCardProps {
    element: any;
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
    if (row.className && row.className === 'dexia.gemk.operationlayer.client.BaseTypeList') {
        const element = row.elementType.split('.').pop();
        return (
            <div>List of <Link to={`/mca-components/components/${element}`}><b>{element}</b></Link></div>
        );
    }
    if (row.className && row.className.startsWith('dexia.opmk.operation')) {
        const element = row.className.split('.').pop();
        return (
            <Link to={`/mca-components/components/${element}`}><b>{element}</b></Link>
        );
    }
    const element = row.className.split('.').pop();
    return (
        <div>{element}</div>
    );
}

const columns: TableColumn<TableRow>[] = [
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
                thirdSortClick: false,     
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
            elementType: item.field.elementType,
            description: item.field.description,
            mandatory: item.mandatory,
        }));
    }
    return [
        {
            id: 0,
            name: fields.field.name,
            className: fields.field.className,
            elementType: fields.field.elementType,
            description: fields.field.description,
            mandatory: fields.mandatory,
        },
    ];
}