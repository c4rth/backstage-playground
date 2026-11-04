import { InputError } from '@backstage/errors';
import type { z } from 'zod/v3';
import type { McpZod } from './outputSchemas';

export { entityOutputSchema } from './outputSchemas';
export type { McpZod } from './outputSchemas';

export {
  logMcpActionExecution,
  logMcpActionRegistration,
  READ_ONLY_ACTION_ATTRIBUTES,
} from './actionUtils';

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

export function pageOutputSchema<T extends z.ZodTypeAny>(zod: McpZod, item: T) {
  return zod.object({
    items: zod.array(item),
    offset: zod.number().int().nonnegative(),
    limit: zod.number().int().min(1).max(MAX_PAGE_LIMIT),
    totalCount: zod.number().int().nonnegative(),
    hasMore: zod.boolean(),
    nextOffset: zod.number().int().nonnegative().nullable(),
  });
}

type FetchedPage<T> = {
  items: T[];
  offset: number;
  limit: number;
  totalCount: number;
};

// Arrays are paginated in memory; fetched pages are wrapped without slicing again.
export function pageItems<T>(
  source: T[] | FetchedPage<T>,
  options: { offset?: number; limit?: number } = {},
) {
  const isArray = Array.isArray(source);
  const totalCount = isArray ? source.length : source.totalCount;
  const offset = isArray ? (options.offset ?? 0) : source.offset;
  const limit = isArray ? (options.limit ?? DEFAULT_PAGE_LIMIT) : source.limit;
  if (!Number.isSafeInteger(offset) || offset < 0) {
    throw new InputError('offset must be a non-negative safe integer');
  }
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > MAX_PAGE_LIMIT) {
    throw new InputError(`limit must be between 1 and ${MAX_PAGE_LIMIT}`);
  }
  const page = isArray ? source.slice(offset, offset + limit) : source.items;
  const hasMore = page.length > 0 && offset + page.length < totalCount;
  return {
    items: page,
    offset,
    limit,
    totalCount,
    hasMore,
    nextOffset: hasMore ? offset + page.length : null,
  };
}
