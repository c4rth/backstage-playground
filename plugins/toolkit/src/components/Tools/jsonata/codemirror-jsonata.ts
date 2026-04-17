import { StreamLanguage, StringStream } from '@codemirror/language';
import { getCustomFunctions } from './jsonata-functions';

/**
 * CodeMirror stream-based language mode for JSONata expressions.
 * Covers: strings, numbers, booleans/null, operators, path navigation,
 * variables ($xxx), built-in and custom functions, comments, regex, backtick-quoted fields.
 */

const BUILTIN_FUNCTIONS = new Set([
  // String functions
  '$string', '$length', '$substring', '$substringBefore', '$substringAfter',
  '$uppercase', '$lowercase', '$trim', '$pad', '$contains', '$split',
  '$join', '$match', '$replace', '$eval', '$base64encode', '$base64decode',
  '$encodeUrlComponent', '$encodeUrl', '$decodeUrlComponent', '$decodeUrl',
  // Numeric functions
  '$number', '$abs', '$floor', '$ceil', '$round', '$power', '$sqrt',
  '$random', '$formatNumber', '$formatBase', '$formatInteger',
  '$parseInteger',
  // Aggregation functions
  '$sum', '$max', '$min', '$average', '$count',
  // Boolean functions
  '$boolean', '$not', '$exists',
  // Array functions
  '$append', '$sort', '$reverse', '$shuffle', '$distinct', '$zip',
  // Object functions
  '$keys', '$values', '$spread', '$merge', '$sift', '$each', '$error',
  '$assert', '$type',
  // Date/time functions
  '$now', '$millis', '$fromMillis', '$toMillis',
  // Higher-order functions
  '$map', '$filter', '$single', '$reduce',
  // Misc
  '$lookup', '$clone',
]);

const CUSTOM_FUNCTIONS = getCustomFunctions().map(name => `$${name}`);

const KEYWORDS = new Set(['and', 'or', 'in', 'true', 'false', 'null']);

interface JSONataState {
  inString: false | '"' | "'";
  inComment: boolean;
  inRegex: boolean;
  inBacktick: boolean;
}

function tokenBase(stream: StringStream, state: JSONataState): string | null {
  // Block comment /* ... */
  if (stream.match('/*')) {
    state.inComment = true;
    return tokenComment(stream, state);
  }

  // Single-line line comment (JSONata supports // comments in some implementations)
  // Not standard but nice to have
  // Skip whitespace
  if (stream.eatSpace()) return null;

  const ch = stream.peek();

  // Strings: double or single quoted
  if (ch === '"' || ch === "'") {
    stream.next();
    state.inString = ch;
    return tokenString(stream, state);
  }

  // Backtick-quoted field names
  if (ch === '`') {
    stream.next();
    state.inBacktick = true;
    return tokenBacktick(stream, state);
  }

  // Regex literal: /pattern/flags
  if (ch === '/') {
    // Only treat as regex if the previous context makes sense.
    // Simple heuristic: if next char is not *, it might be regex or just division
    stream.next();
    if (stream.peek() === '*') {
      // Already handled above for block comments, but just in case
      state.inComment = true;
      return tokenComment(stream, state);
    }
    // Try to consume as regex
    state.inRegex = true;
    return tokenRegex(stream, state);
  }

  // Numbers
  if (/\d/.test(ch!)) {
    stream.match(/^\d*\.?\d+([eE][+-]?\d+)?/);
    return 'number';
  }
  if (ch === '-' || ch === '+') {
    // Could be a signed number if next is digit
    const next = stream.string.charAt(stream.pos + 1);
    if (/\d/.test(next)) {
      stream.next();
      stream.match(/^\d*\.?\d+([eE][+-]?\d+)?/);
      return 'number';
    }
  }

  // Variables: $identifier or just $
  if (ch === '$') {
    stream.next();
    const varName = '$';
    if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) {
      const fullName = varName + stream.current().slice(1);
      if (BUILTIN_FUNCTIONS.has(fullName) || CUSTOM_FUNCTIONS.includes(fullName)) {
        return 'keyword';
      }
      return 'variableName.definition';
    }
    // Lone $ (context reference)
    return 'variableName.definition';
  }

  // Identifiers and keywords
  if (/[a-zA-Z_]/.test(ch!)) {
    stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
    const word = stream.current();
    if (KEYWORDS.has(word)) {
      if (word === 'true' || word === 'false') return 'bool';
      if (word === 'null') return 'null';
      return 'keyword';
    }
    // Check if followed by ( → function call
    if (stream.peek() === '(') {
      return 'function(variableName)';
    }
    return 'propertyName';
  }

  // Operators
  if (ch === '=' || ch === '!' || ch === '<' || ch === '>') {
    stream.next();
    stream.eat('=');
    return 'operator';
  }
  if (ch === '&') {
    stream.next();
    return 'operator';
  }
  if (ch === '~' && stream.match(/^~>/)) {
    return 'operator';
  }

  // Path separator
  if (ch === '.') {
    stream.next();
    if (stream.eat('.')) {
      // Range operator ..
      return 'operator';
    }
    return 'punctuation';
  }

  // Brackets
  if (ch === '[' || ch === ']') {
    stream.next();
    return 'squareBracket';
  }
  if (ch === '{' || ch === '}') {
    stream.next();
    return 'brace';
  }
  if (ch === '(' || ch === ')') {
    stream.next();
    return 'paren';
  }

  // Special operators
  if (ch === '*') {
    stream.next();
    if (stream.eat('*')) return 'operator'; // descendant **
    return 'operator'; // wildcard *
  }
  if (ch === '?') {
    stream.next();
    return 'operator'; // filter/ternary
  }
  if (ch === ':') {
    stream.next();
    return 'punctuation';
  }
  if (ch === ',') {
    stream.next();
    return 'separator';
  }
  if (ch === ';') {
    stream.next();
    return 'separator';
  }
  if (ch === '#') {
    stream.next();
    return 'operator'; // order-by
  }
  if (ch === '^') {
    stream.next();
    return 'operator'; // sort
  }
  if (ch === '%') {
    stream.next();
    return 'operator'; // parent
  }
  if (ch === '|') {
    stream.next();
    return 'operator'; // transform
  }

  // Arithmetic
  if (ch === '+' || ch === '-') {
    stream.next();
    return 'operator';
  }

  // Catch-all
  stream.next();
  return null;
}

function tokenString(stream: StringStream, state: JSONataState): string {
  const quote = state.inString;
  let escaped = false;
  while (!stream.eol()) {
    const ch = stream.next();
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (ch === quote) {
      state.inString = false;
      return 'string';
    }
  }
  // Unterminated string — reset
  state.inString = false;
  return 'string';
}

function tokenBacktick(stream: StringStream, state: JSONataState): string {
  while (!stream.eol()) {
    if (stream.next() === '`') {
      state.inBacktick = false;
      return 'propertyName';
    }
  }
  state.inBacktick = false;
  return 'propertyName';
}

function tokenComment(stream: StringStream, state: JSONataState): string {
  while (!stream.eol()) {
    if (stream.match('*/')) {
      state.inComment = false;
      return 'comment';
    }
    stream.next();
  }
  return 'comment';
}

function tokenRegex(stream: StringStream, state: JSONataState): string {
  let escaped = false;
  while (!stream.eol()) {
    const ch = stream.next();
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (ch === '/') {
      stream.match(/^[gimsuy]*/); // flags
      state.inRegex = false;
      return 'regexp';
    }
  }
  state.inRegex = false;
  return 'regexp';
}

export const jsonataLanguage = StreamLanguage.define<JSONataState>({
  name: 'jsonata',
  startState: (): JSONataState => ({
    inString: false,
    inComment: false,
    inRegex: false,
    inBacktick: false,
  }),
  token(stream: StringStream, state: JSONataState): string | null {
    if (state.inComment) return tokenComment(stream, state);
    if (state.inString) return tokenString(stream, state);
    if (state.inBacktick) return tokenBacktick(stream, state);
    if (state.inRegex) return tokenRegex(stream, state);
    return tokenBase(stream, state);
  },
});
