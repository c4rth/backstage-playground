// Define the shape of our function library
export interface JsonataFunction {
  implementation: (...args: any[]) => any;
  signature: string;
}

export interface FunctionLibrary {
  [key: string]: JsonataFunction;
}
