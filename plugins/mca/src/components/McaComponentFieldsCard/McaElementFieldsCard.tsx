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
    if (row.className === 'dexia.gemk.operationlayer.client.BaseTypeList') {
        const element = row.elementType.split('.').pop();
        return (
            <div>List of <Link to={`/mca/components/${element}`}><b>{element}</b></Link></div>
        );
    }
    if (row.className?.startsWith('dexia.opmk.operation')) {
        const element = row.className.split('.').pop();
        return (
            <Link to={`/mca/components/${element}`}><b>{element}</b></Link>
        );
    }
    if (row.className?.startsWith('dexia.opmk.basetypes')) {
        const element = row.className.split('.').pop();
        return (
            <Link to={`/mca/basetypes/${element}`}><b>{element}</b></Link>
        );
    }
    return <div>{row.className}</div>;
}

const columns: TableColumn<TableRow>[] = [
    {
        title: 'Name',
        width: '20%',
        field: 'name',
        defaultSort: 'asc',
        highlight: true,
        render: row => <div>{row.name}</div>,
    },
    {
        title: 'Class',
        width: '25%',
        searchable: true,
        customFilterAndSearch: (query, row) => `${row.className} ${row.elementType}`.toLowerCase().includes(query.toLowerCase()),
        render: getClassName,
    },
    {
        title: 'Description',
        width: '48%',
        field: 'description',
        render: row => <div>{row.description}</div>,
    },
    {
        title: 'Mandatory',
        width: '7%',
        field: 'mandatory',
        render: row => (row.mandatory ? <StatusOK /> : <StatusAborted />),
    },
];

export const McaElementFieldsCard = ({ element }: McaElementFieldsCardProps) => {
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
};

function toTableRows(fields: any): TableRow[] {
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
    if (fields && fields.field) {
        return [{
            id: 0,
            name: fields.field.name,
            className: fields.field.className,
            elementType: fields.field.elementType,
            description: fields.field.description,
            mandatory: fields.mandatory,
        }];
    }
    return [];
}