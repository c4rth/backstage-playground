import data from './fake-data-v2.json';

export function dummyCallV2(): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}
