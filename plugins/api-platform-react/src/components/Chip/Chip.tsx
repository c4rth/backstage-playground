import { forwardRef, CSSProperties, ReactElement, ReactNode } from 'react';
import { Button } from 'react-aria-components';

export interface ChipProps {
  /** The label content of the chip */
  label: ReactNode;
  /** Icon element to display at the start of the chip */
  icon?: ReactElement;
  /** Callback fired when chip is clicked */
  onClick?: () => void;
  /** The color of the chip */
  color?: 'default' | 'primary' | 'secondary' | string;
  /** The text color of the chip */
  textColor?: string;
  /** The size of the chip */
  size?: 'small' | 'medium';
  /** The variant to use */
  variant?: 'filled' | 'outlined';
  /** If true, the chip will appear clickable and will raise on hover */
  clickable?: boolean;
  /** If true, the chip should be displayed in a disabled state */
  disabled?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

const getChipStyles = (
  color: ChipProps['color'],
  textColor: ChipProps['textColor'] | undefined,
  variant: ChipProps['variant'],
  size: ChipProps['size'],
  clickable: boolean,
  disabled: boolean,
): CSSProperties => {
  const baseStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    fontFamily: 'var(--bui-font-regular)',
    fontWeight: 'var(--bui-font-weight-regular)',
    whiteSpace: 'nowrap',
    cursor: clickable ? 'pointer' : 'default',
    outline: 0,
    textDecoration: 'none',
    border: 0,
    padding: 0,
    verticalAlign: 'middle',
    position: 'relative',
    transition:
      'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    height: size === 'small' ? '24px' : '32px',
    fontSize: size === 'small' ? '0.8125rem' : '0.875rem',
    borderRadius: size === 'small' ? '12px' : '16px',
  };

  if (disabled) {
    baseStyles.opacity = 0.38;
    baseStyles.pointerEvents = 'none';
  }

  // Color and variant styles
  if (variant === 'filled') {
    if (color === 'primary') {
      baseStyles.backgroundColor = 'var(--bui-bg-solid)';
      baseStyles.color = 'var(--bui-fg-solid)';
      baseStyles.backgroundColor = '#C30045';
      baseStyles.color = '#fff';
    } else if (color === 'secondary') {
      baseStyles.backgroundColor = 'var(--bui-bg-neutral-1, #e0e0e0)';
      baseStyles.color = 'var(--bui-black)';
    } else if (color === 'default') {
      baseStyles.backgroundColor = 'var(--bui-bg-neutral-1, #e0e0e0)';
      baseStyles.color = 'var(--bui-black)';
      baseStyles.color = '#000';
    } else {
      baseStyles.backgroundColor = color;
      baseStyles.color = textColor || '#fff';
    }
  } else {
    // outlined variant
    baseStyles.border = '1px solid #0000003b';
  }
  return baseStyles;
};

const getLabelStyles = (size: ChipProps['size']): CSSProperties => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  paddingLeft: size === 'small' ? '8px' : '12px',
  paddingRight: size === 'small' ? '8px' : '12px',
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
});

const getIconStyles = (size: ChipProps['size']): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: size === 'small' ? '4px' : '5px',
  marginRight: size === 'small' ? '-4px' : '-6px',
  width: size === 'small' ? '16px' : '18px',
  height: size === 'small' ? '16px' : '18px',
});

export const Chip = forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      label,
      icon,
      onClick,
      color = 'default',
      textColor = undefined,
      size = 'medium',
      variant = 'filled',
      clickable = false,
      disabled = false,
      className = '',
      style,
    },
    ref,
  ) => {
    const isClickable = clickable || !!onClick;

    const chipStyles = {
      ...getChipStyles(color, textColor, variant, size, isClickable, disabled),
      ...style,
    };

    const content = (
      <>
        {icon && <span style={getIconStyles(size)}>{icon}</span>}
        <span style={getLabelStyles(size)}>{label}</span>
      </>
    );

    if (isClickable) {
      return (
        <Button
          ref={ref as any}
          className={className}
          style={chipStyles}
          onPress={onClick}
          isDisabled={disabled}
          aria-label={label as string | undefined}
        >
          {content}
        </Button>
      );
    }

    return (
      <div ref={ref} className={className} style={chipStyles}>
        {content}
      </div>
    );
  },
);

Chip.displayName = 'Chip';
