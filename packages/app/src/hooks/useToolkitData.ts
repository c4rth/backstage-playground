import { useCallback, useEffect, useState } from 'react';
import { ToolkitLink } from '../types/types';

export function useToolkitData(): {
    data: ToolkitLink[] | undefined;
    error: Error | undefined;
    isLoading: boolean;
} {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [data, setData] = useState<ToolkitLink[]>();
    const [error, setError] = useState<Error>();

    const fetchData = useCallback(async () => {
        const res = await fetch('/homepage/data.json');
        const qsData = await res.json();
        setData(qsData);
        setIsLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchData().catch(err => {
            setError(err);
            setIsLoading(false);
        });
    }, [fetchData, setData]);

    return { data, error, isLoading };
};