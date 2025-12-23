import { InfoCard, Table, TableColumn } from '@backstage/core-components';
import { Flex, Box, Text } from '@backstage/ui';
import { memo, useMemo } from 'react';

export interface McaComponentMethodsCardProps {
    data: any;
    componentType?: 'element' | 'operation';
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

const tableOptions = {
    search: true,
    padding: 'dense' as const,
    paging: false,
    draggable: false,
    thirdSortClick: false,
    showEmptyDataSourceMessage: true,
};

function getMethods(data: any): MethodRow[] {
    const implementedMethods = data?.implementedMethods?.implementedMethod;

    if (!implementedMethods) {
        return [];
    }

    const methodsArray = Array.isArray(implementedMethods)
        ? implementedMethods
        : [implementedMethods];

    return transformMethodsToRows(methodsArray);
}

export const McaComponentMethodsCard = memo<McaComponentMethodsCardProps>(({ data, componentType = 'element' }) => {
    const methods = useMemo(() => getMethods(data), [data]);
    
    const tableTitle = (
        <Flex align="center">
            Implemented Methods ({methods.length})
        </Flex>
    );

    if (methods.length === 0) {
        return (
            <InfoCard title="Implemented Methods">
                <Box p='2'>
                    <Text variant='body-medium' color="secondary">
                        No implemented methods found for this {componentType}.
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
