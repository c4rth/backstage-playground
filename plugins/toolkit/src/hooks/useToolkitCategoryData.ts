import { useCallback, useEffect, useState } from 'react';
import { CategoryData } from '../types/types';

export function useToolkitCategoryData(baseUrl: string): {
  data: CategoryData | undefined;
  error: Error | undefined;
  isLoading: boolean;
} {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<CategoryData>();
  const [error, setError] = useState<Error>();

  const fetchData = useCallback(async () => {
    const res = await fetch(`${baseUrl}/homepage/data-category.json`);
    const categoryData: CategoryData = await res.json();
    setData(categoryData);
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
}
