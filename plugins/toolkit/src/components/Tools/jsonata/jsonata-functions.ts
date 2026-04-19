import jsonata from 'jsonata';
import { FunctionLibrary } from './types';
import { funcEntries } from './functions/func-strings.generated';
import { fromMillisZoned } from './functions/fromMillisZoned';

// JS-implemented custom functions (not from .func files)
export const jsFunctions: FunctionLibrary = {
  /*
    toCurrency: {
        implementation: (value: number, currency: string = 'USD'): string => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
            }).format(value);
        },
        signature: '<n s:s>', // Expects Number, String; returns String
    },
    formatDate: {
        implementation: (dateStr: string): string => {
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
        },
        signature: '<s:s>',
    },
    */
};

// JSONata expressions loaded directly from .func files
export const funcExpressions: Record<string, string> = Object.fromEntries(
  funcEntries.map(({ name, func }) => [name, func]),
);

// Registers JS-implemented functions on the given expression (synchronous).
export const registerCustomFunctions = (expr: jsonata.Expression): void => {
  Object.entries(jsFunctions).forEach(
    ([name, { implementation, signature }]) => {
      expr.registerFunction(name, implementation, signature);
    },
  );
};

// Evaluates every .func expression string via JSONata and returns the resulting
// lambdas as a bindings map ready to pass to expression.evaluate(data, bindings).
// $fromMillisZoned is injected first so deps can use it.
// Funcs are evaluated in declaration order so deps (e.g. dummyMCTimestampJSON)
// are already in scope when the transform funcs are compiled.
export const loadFuncBindings = async (): Promise<Record<string, any>> => {
  const bindings: Record<string, any> = {};
  bindings.fromMillisZoned = fromMillisZoned;
  for (const [name, funcStr] of Object.entries(funcExpressions)) {
    bindings[name] = await jsonata(funcStr).evaluate({}, bindings);
  }
  return bindings;
};

export const getCustomFunctions = (): string[] => {
  return [
    ...Object.keys(jsFunctions),
    'fromMillisZoned',
    ...Object.keys(funcExpressions),
  ];
};
