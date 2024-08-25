import { useCallback, useEffect, useState } from 'react';
import { CustomzationDataLinks } from '../types/types';

const homePage = 'homePage';
export const learningPathPage = 'learningPathPage';

const supportedCustomizationFallbackData = {
    [homePage]: {
        fallback: '/homepage/data.json',
    },
    [learningPathPage]: {
        fallback: '/learning-paths/data.json',
    },
};

export const useCustomizationData = (
    selectedCustomizationPage: 'homePage' | 'learningPathPage' = homePage,
): {
    data: CustomzationDataLinks | undefined;
    error: Error | undefined;
    isLoading: boolean;
} => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [data, setData] = useState<CustomzationDataLinks>();
    const [error, setError] = useState<Error>();

    const fetchData = useCallback(async () => {
        const res = await fetch(
            supportedCustomizationFallbackData[selectedCustomizationPage].fallback,
        );
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