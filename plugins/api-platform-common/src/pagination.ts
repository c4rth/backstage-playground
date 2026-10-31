export const DEFAULT_LIST_LIMIT = 20;
export const MAX_LIST_LIMIT = 100;

export function normalizePagination(offset?: number, limit?: number) {
  const normalizedOffset =
    offset !== undefined && Number.isFinite(offset)
      ? Math.max(0, Math.floor(offset))
      : 0;
  const normalizedLimit =
    limit !== undefined && Number.isFinite(limit)
      ? Math.min(MAX_LIST_LIMIT, Math.max(1, Math.floor(limit)))
      : DEFAULT_LIST_LIMIT;

  return { offset: normalizedOffset, limit: normalizedLimit };
}

export function createPage<T>(
  items: T[],
  offset: number,
  limit: number,
  totalCount: number,
) {
  return {
    items,
    offset,
    limit,
    totalCount,
    hasMore: offset + items.length < totalCount,
  };
}
