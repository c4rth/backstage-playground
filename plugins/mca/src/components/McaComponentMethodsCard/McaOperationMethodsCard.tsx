import { InfoCard, Table, TableColumn } from '@backstage/core-components';
import { Box, Typography } from '@material-ui/core';
import { useMemo, memo } from 'react';

export interface McaOperationMethodsCardProps {
    operation: any;
}

type MethodRow = {
    id: number;
    name: string;
};

const columns: TableColumn<MethodRow>[] = [
    {
        title: 'Method Name',
        width: '100%',
        field: 'name',
        defaultSort: 'asc',
        highlight: true,
        render: ({ name }) => (
            <Typography variant="body2">{name}</Typography>
        ),
    },
];

function transformMethodsToRows(methods: any[]): MethodRow[] {

    if (!Array.isArray(methods)) {
        return [];
    }

    return methods
        .filter(method => method?.name?.trim()) 
        .map((method, index) => ({
            id: index,
            name: method.name.trim(),
        }));
}

export const McaOperationMethodsCard = memo<McaOperationMethodsCardProps>(({ operation }) => {
    const methods = useMemo(() => {
        const implementedMethods = operation?.implementedMethods?.implementedMethod;
        
        if (!implementedMethods) {
            return [];
        }

        const methodsArray = Array.isArray(implementedMethods) 
            ? implementedMethods 
            : [implementedMethods];

        return transformMethodsToRows(methodsArray);
    }, [operation?.implementedMethods?.implementedMethod]);

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
            Implemented Methods ({methods.length})
        </Box>
    ), [methods.length]);

    if (methods.length === 0) {
        return (
            <InfoCard title="Implemented Methods">
                <Box p={2}>
                    <Typography variant="body2" color="textSecondary">
                        No implemented methods found for this operation.
                    </Typography>
                </Box>
            </InfoCard>
        );
    }

    return (
        <Table<MethodRow>
            columns={columns}
            options={tableOptions}
            title={tableTitle}
            data={methods}
        />
    );
});