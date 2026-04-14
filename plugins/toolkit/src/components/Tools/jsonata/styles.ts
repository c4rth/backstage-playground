import React from 'react';

export const DIVIDER_SIZE = 2;

export const dividerBaseStyle: React.CSSProperties = {
  flexShrink: 0,
  background: 'var(--bui-gray-4)',
  borderRadius: '3px',
  transition: 'background 0.15s',
  position: 'relative',
  zIndex: 10,
};

export const styles = {
  container: { height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' as const },
  toolbar: { padding: '8px', borderBottom: '1px solid var(--bui-gray-4)', flexShrink: 0 },

  // Main Grid Layout for Left/Right split
  mainGrid: (percentage: number) => ({
    display: 'grid',
    gridTemplateColumns: `${percentage}% ${DIVIDER_SIZE}px minmax(0, 1fr)`,
    flex: 1,
    minHeight: 0,
    width: '100%',
    overflow: 'hidden',
  }),

  // Right Grid Layout for Top/Bottom split
  rightGrid: (percentage: number) => ({
    display: 'grid',
    gridTemplateRows: `${percentage}% ${DIVIDER_SIZE}px minmax(0, 1fr)`,
    height: '100%',
    width: '100%',
    minHeight: 0,
    overflow: 'hidden',
  }),

  panel: {
    overflow: 'hidden',
    position: 'relative' as const,
    height: '100%',
    width: '100%',
    minWidth: 0,
    minHeight: 0,
  },

  panelContent: {
    position: 'absolute' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    overflow: 'hidden',
  },

  resultBox: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'auto',
    padding: '8px',
    fontFamily: 'monospace',
    fontSize: '14px',
    border: '1px solid var(--bui-gray-4)',
    borderRadius: '4px',
    backgroundColor: 'var(--bui-bg-neutral-1)',
    color: 'var(--bui-fg-default)',
    boxSizing: 'border-box' as const,
  }
};
