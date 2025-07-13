import { Table, TableColumn, Link, StatusOK, StatusAborted } from "@backstage/core-components";
import { Box } from "@material-ui/core";
import { memo, useMemo } from "react";

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

const ClassNameRenderer = memo<{ row: TableRow }>(({ row }) => {
    const content = useMemo(() => {
        const { className, elementType } = row;
        
        if (className === 'dexia.gemk.operationlayer.client.BaseTypeList') {
            const element = elementType?.split('.').pop();
            return (
                <div>
                    List of <Link to={`/mca/components/${element}`}><b>{element}</b></Link>
                </div>
            );
        }
        
        if (className?.startsWith('dexia.opmk.operation')) {
            const element = className.split('.').pop();
            return (
                <Link to={`/mca/components/${element}`}><b>{element}</b></Link>
            );
        }
        
        if (className?.startsWith('dexia.opmk.basetypes')) {
            const element = className.split('.').pop();
            return (
                <Link to={`/mca/basetypes/${element}`}><b>{element}</b></Link>
            );
        }
        
        return <div>{className}</div>;
    }, [row]);
    
    return content;
});

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
        render: (row) => <ClassNameRenderer row={row} />,
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

export const McaElementFieldsCard = memo<McaElementFieldsCardProps>(({ element }) => {
    const rows = useMemo(() => 
        toTableRows(element?.fields?.FieldInput), 
        [element?.fields?.FieldInput]
    );

    const tableOptions = useMemo(() => ({
        search: true,
        padding: 'dense' as const,
        paging: false,
        draggable: false,
        thirdSortClick: false,
        showEmptyDataSourceMessage: true,
    }), []);

    const tableTitle = useMemo(() => (
        <Box display="flex" alignItems="center">
            <Box mr={1} />
            Fields ({rows.length})
        </Box>
    ), [rows.length]);

    return (
        <Table<TableRow>
            columns={columns}
            options={tableOptions}
            title={tableTitle}
            data={rows}
        />
    );
});

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