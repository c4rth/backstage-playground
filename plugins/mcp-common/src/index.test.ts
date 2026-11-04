import { pageItems } from './index';

describe('pageItems', () => {
  it('retrieves every item across full, partial, empty and final pages', () => {
    const items = Array.from({ length: 237 }, (_, i) => i);
    const collected: number[] = [];
    let offset = 0;
    for (;;) {
      const page = pageItems(items, { offset, limit: 100 });
      collected.push(...page.items);
      expect(page.totalCount).toBe(237);
      expect(page.nextOffset === null).toBe(!page.hasMore);
      if (!page.hasMore) break;
      if (page.nextOffset === null) throw new Error('Missing continuation');
      offset = page.nextOffset;
    }
    expect(collected).toEqual(items);
    expect(pageItems(items, { offset: 237 })).toMatchObject({
      items: [],
      hasMore: false,
      nextOffset: null,
    });
    expect(pageItems([])).toMatchObject({
      items: [],
      totalCount: 0,
      hasMore: false,
    });
  });

  it.each([0, -1, 101, 1.5, Infinity])('rejects limit=%s', limit => {
    expect(() => pageItems([], { limit })).toThrow('limit');
  });

  it('wraps a fetched short page without slicing it again', () => {
    expect(
      pageItems({ items: ['item'], offset: 20, limit: 5, totalCount: 26 }),
    ).toEqual({
      items: ['item'],
      offset: 20,
      limit: 5,
      totalCount: 26,
      hasMore: true,
      nextOffset: 21,
    });
  });

  it.each([21, 26])(
    'wraps a final fetched page at totalCount=%s',
    totalCount => {
      expect(
        pageItems({
          items: totalCount === 21 ? ['item'] : [],
          offset: totalCount === 21 ? 20 : 26,
          limit: 5,
          totalCount,
        }),
      ).toMatchObject({ totalCount, hasMore: false, nextOffset: null });
    },
  );

  it('does not advertise continuation from an empty fetched page', () => {
    expect(
      pageItems({ items: [], offset: 0, limit: 5, totalCount: 10 }),
    ).toMatchObject({ items: [], hasMore: false, nextOffset: null });
  });

  it.each([-1, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'rejects offset=%s for both full results and fetched pages',
    offset => {
      expect(() => pageItems([], { offset })).toThrow('offset');
      expect(() =>
        pageItems({ items: [], offset, limit: 5, totalCount: 0 }),
      ).toThrow('offset');
    },
  );
});
