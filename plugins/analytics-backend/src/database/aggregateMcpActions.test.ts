import { aggregateMcpActions } from './aggregateMcpActions';

describe('aggregateMcpActions', () => {
  it('combines outcomes per tool and sorts by total calls', () => {
    expect(
      aggregateMcpActions([
        { subject: 'both', extension: 'succeeded', count: '3' },
        { subject: 'failure-only', extension: 'failed', count: '2' },
        { subject: 'both', extension: 'failed', count: '4' },
        { subject: 'success-only', extension: 'succeeded', count: 5 },
      ]),
    ).toEqual([
      { toolName: 'both', succeeded: 3, failed: 4 },
      { toolName: 'success-only', succeeded: 5, failed: 0 },
      { toolName: 'failure-only', succeeded: 0, failed: 2 },
    ]);
  });

  it('returns an empty list when there are no events', () => {
    expect(aggregateMcpActions([])).toEqual([]);
  });

  it.each([
    { subject: 'test', extension: 'unknown', count: '1' },
    { subject: 'test', extension: 'succeeded', count: 'invalid' },
    { subject: 'test', extension: 'failed', count: -1 },
  ])('rejects invalid grouped rows', row => {
    expect(() => aggregateMcpActions([row])).toThrow('Invalid MCP analytics');
  });
});
