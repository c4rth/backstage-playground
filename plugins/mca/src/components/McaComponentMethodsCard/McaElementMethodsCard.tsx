import { InfoCard, Table, TableColumn } from '@backstage/core-components';
import { Flex, Box, Text } from '@backstage/ui';
import { useMemo, memo } from 'react';

export interface McaElementMethodsCardProps {
    element: any;
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
            <Text variant='body-medium'>{name}</Text>
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

export const McaElementMethodsCard = memo<McaElementMethodsCardProps>(({ element }) => {
    const methods = useMemo(() => {
        const implementedMethods = element?.implementedMethods?.implementedMethod;
        
        if (!implementedMethods) {
            return [];
        }

        const methodsArray = Array.isArray(implementedMethods) 
            ? implementedMethods 
            : [implementedMethods];

        return transformMethodsToRows(methodsArray);
    }, [element?.implementedMethods?.implementedMethod]);

    const tableOptions = useMemo(() => ({
        search: true,
        padding: 'dense' as const,
        paging: false,
        draggable: false,
        thirdSortClick: false,
        showEmptyDataSourceMessage: true,
    }), []);

    const tableTitle = useMemo(() => (
        <Flex align="center">
            Implemented Methods ({methods.length})
        </Flex>
    ), [methods.length]);

    if (methods.length === 0) {
        return (
            <InfoCard title="Implemented Methods">
                <Box p='2'>
                    <Text variant='body-medium' color="secondary">
                        No implemented methods found for this element.
                    </Text>
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