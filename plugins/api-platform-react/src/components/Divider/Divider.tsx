import { forwardRef, CSSProperties } from 'react';
import { Separator, SeparatorProps as AriaSeparatorProps } from 'react-aria-components';

export interface DividerProps extends Omit<AriaSeparatorProps, 'orientation'> {
  /** The component orientation */
  orientation?: 'horizontal' | 'vertical';
  /** If true, the divider will have a lighter color */
  light?: boolean;
  /** The variant to use */
  variant?: 'fullWidth' | 'inset' | 'middle';
  /** If true, the divider will be absolutely positioned */
  absolute?: boolean;
  /** If true, adds margin to the divider */
  flexItem?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

const getDividerStyles = (
  orientation: DividerProps['orientation'],
  variant: DividerProps['variant'],
  light: boolean,
  absolute: boolean,
  flexItem: boolean
): CSSProperties => {
  const isHorizontal = orientation === 'horizontal';

  const baseStyles: CSSProperties = {
    border: 'none',
    backgroundColor: light 
      ? 'var(--bui-divider-light, rgba(0, 0, 0, 0.08))' 
      : 'var(--bui-divider, rgba(0, 0, 0, 0.12))',
    flexShrink: 0,
  };

  if (absolute) {
    baseStyles.position = 'absolute';
    baseStyles.bottom = 0;
    baseStyles.left = 0;
    baseStyles.width = '100%';
  }

  if (isHorizontal) {
    baseStyles.height = '1px';
    baseStyles.width = '100%';
    
    if (variant === 'inset') {
      baseStyles.marginLeft = '72px';
    } else if (variant === 'middle') {
      baseStyles.marginLeft = '16px';
      baseStyles.marginRight = '16px';
    }
  } else {
    // vertical
    baseStyles.width = '1px';
    baseStyles.height = '100%';
    
    if (flexItem) {
      baseStyles.alignSelf = 'stretch';
      baseStyles.height = 'auto';
    }
    
    if (variant === 'inset') {
      baseStyles.marginTop = '8px';
      baseStyles.marginBottom = '8px';
    } else if (variant === 'middle') {
      baseStyles.marginTop = '16px';
      baseStyles.marginBottom = '16px';
    }
  }

  return baseStyles;
};

export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  (
    {
      orientation = 'horizontal',
      light = false,
      variant = 'fullWidth',
      absolute = false,
      flexItem = false,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const dividerStyles = {
      ...getDividerStyles(orientation, variant, light, absolute, flexItem),
      ...style,
    };

    return (
      <Separator
        ref={ref as any}
        orientation={orientation}
        className={className}
        style={dividerStyles}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';
