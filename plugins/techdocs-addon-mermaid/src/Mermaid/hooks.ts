import mermaid from 'mermaid';

export const isMermaidCode = (code: string): boolean => {
  try {
    mermaid.detectType(code);
    return true;
  } catch (_) {
    return false;
  }
};
