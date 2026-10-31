import { createPage, normalizePagination } from './pagination';

describe('pagination', () => {
  it('uses the default page and clamps requested values', () => {
    expect(normalizePagination()).toEqual({ offset: 0, limit: 20 });
    expect(normalizePagination(-3, 500)).toEqual({ offset: 0, limit: 100 });
  });

  it('signals continuation for empty, intermediate, and final pages', () => {
    expect(createPage([], 0, 20, 0).hasMore).toBe(false);
    expect(createPage(['a', 'b'], 0, 2, 3).hasMore).toBe(true);
    expect(createPage(['c'], 2, 2, 3).hasMore).toBe(false);
    expect(createPage([], 3, 2, 3).hasMore).toBe(false);
  });
});
