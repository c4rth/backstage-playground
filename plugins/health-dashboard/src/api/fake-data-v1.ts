import nonPrdData from './fake-data-v1-nonprd.json';
import prdData from './fake-data-v1-prd.json';

export function dummyCallV1(prd: boolean): Response {
  return new Response(JSON.stringify(prd ? prdData : nonPrdData), {
    headers: { 'Content-Type': 'application/json' },
  });
}
