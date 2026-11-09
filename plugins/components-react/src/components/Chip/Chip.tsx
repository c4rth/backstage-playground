import {
  forwardRef,
  CSSProperties,
  HTMLAttributes,
  ReactElement,
  ReactNode,
} from 'react';
import { useFocusable, useObjectRef } from 'react-aria';
import { Button } from 'react-aria-components';

export interface ChipProps {
  /** The label content of the chip, truncated with ellipsis when it overflows */
  label: ReactNode;
  /** Icon element to display at the start of the chip */
  icon?: ReactElement;
  /** Callback fired when chip is clicked */
  onClick?: () => void;
  /** The color of the chip */
  chipColor?: 'default' | 'primary' | 'secondary' | 'outlined' | string;
  /** The color of the label text */
  labelColor?: string;
  /** The size of the chip */
  size?: 'small' | 'medium';
  /** The variant to use */
  variant?: 'filled' | 'outlined';
  /** If true, the chip will appear clickable and will raise on hover */
  clickable?: boolean;
  /** Inline styles */
  style?: CSSProperties;
}

const getChipStyles = (
  color: ChipProps['chipColor'],
  variant: ChipProps['variant'],
  size: ChipProps['size'],
  clickable: boolean,
): CSSProperties => {
  const baseStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    flexShrink: 0,
    maxWidth: '100%',
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

  // Color and variant styles
  if (variant === 'filled') {
    if (color === 'primary') {
      baseStyles.backgroundColor = 'var(--bui-accent-bg)';
      baseStyles.color = 'var(--bui-accent-fg)';
    } else if (color === 'secondary') {
      baseStyles.backgroundColor = 'var(--bui-bg-neutral-1, #e0e0e0)';
      // baseStyles.color = 'var(--bui-black)';
    } else if (color === 'default') {
      baseStyles.backgroundColor = 'var(--bui-bg-neutral-1, #e0e0e0)';
      // baseStyles.color = 'var(--bui-black)';
    } else if (color === 'outlined') {
      baseStyles.backgroundColor = 'transparent';
      baseStyles.border =
        '1px solid color-mix(in srgb, var(--bui-accent-bg) 20%, transparent)';
    } else {
      baseStyles.backgroundColor = color;
    }
  } else {
    // outlined variant
    baseStyles.border = '1px solid #0000003b';
  }
  return baseStyles;
};

const getLabelStyles = (
  chipColor: ChipProps['chipColor'],
  variant: ChipProps['variant'],
  size: ChipProps['size'],
  labelColor?: ChipProps['labelColor'],
): CSSProperties => ({
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  paddingLeft: size === 'small' ? '8px' : '12px',
  paddingRight: size === 'small' ? '8px' : '12px',
  whiteSpace: 'nowrap',
  display: 'block',
  color:
    labelColor ??
    (variant === 'filled' && chipColor === 'primary'
      ? 'var(--bui-white)'
      : 'var(--bui-fg-primary)'),
});

const getIconStyles = (size: ChipProps['size']): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: size === 'small' ? '12px' : '14px',
  height: size === 'small' ? '12px' : '14px',
  color: 'var(--bui-fg-primary)',
});

const ChipContainer = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  const objectRef = useObjectRef(ref);
  const { focusableProps } = useFocusable(props, objectRef);

  return <div {...focusableProps} {...props} ref={objectRef} />;
});

ChipContainer.displayName = 'ChipContainer';

export const Chip = forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      label,
      icon,
      onClick,
      chipColor: color = 'default',
      labelColor,
      size = 'medium',
      variant = 'filled',
      clickable = false,
      style,
    },
    ref,
  ) => {
    const isClickable = !!onClick;

    const chipStyles = {
      ...getChipStyles(color, variant, size, clickable),
      ...style,
    };

    const content = (
      <>
        {icon && <span style={getIconStyles(size)}>{icon}</span>}
        <span style={getLabelStyles(color, variant, size, labelColor)}>
          {label}
        </span>
      </>
    );

    if (isClickable) {
      return (
        <Button
          ref={ref as any}
          style={chipStyles}
          onPress={onClick}
          aria-label={label as string | undefined}
        >
          {content}
        </Button>
      );
    }

    return (
      <ChipContainer ref={ref} style={chipStyles}>
        {content}
      </ChipContainer>
    );
  },
);

Chip.displayName = 'Chip';
