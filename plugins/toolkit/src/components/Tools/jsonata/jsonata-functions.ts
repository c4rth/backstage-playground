import jsonata from 'jsonata';

// Define the shape of our function library
interface JsonataFunction {
  implementation: (...args: any[]) => any;
  signature: string;
}

interface FunctionLibrary {
  [key: string]: JsonataFunction;
}

const customFunctions: FunctionLibrary = {
  toCurrency: {
    implementation: (value: number, currency: string = 'USD'): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(value);
    },
    signature: '<n s:s>' // Expects Number, String; returns String
  },

  formatDate: {
    implementation: (dateStr: string): string => {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
    },
    signature: '<s:s>'
  }
};

export const registerCustomFunctions = (expr: jsonata.Expression) => {
  Object.entries(customFunctions).forEach(([name, { implementation, signature }]) => {
    expr.registerFunction(name, implementation, signature);
  });
};

export const getCustomFunctions = (): string[] => {
  return Object.keys(customFunctions);
};