import { forwardRef, CSSProperties, ReactElement, ReactNode } from 'react';
import { Button } from 'react-aria-components';

export interface ChipProps {
  /** The label content of the chip */
  label: ReactNode;
  /** Icon element to display at the start of the chip */
  icon?: ReactElement;
  /** Icon element to display when deletable */
  deleteIcon?: ReactElement;
  /** Callback fired when delete icon is clicked */
  onDelete?: () => void;
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
  /** Avatar element to display at the start */
  avatar?: ReactElement;
}

const getChipStyles = (
  color: ChipProps['color'],
  textColor: ChipProps['textColor'] | undefined,
  variant: ChipProps['variant'],
  size: ChipProps['size'],
  clickable: boolean,
  disabled: boolean
): CSSProperties => {
  const baseStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    fontFamily: 'var(--bui-font-regular, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
    fontWeight: 400,
    whiteSpace: 'nowrap',
    cursor: clickable ? 'pointer' : 'default',
    outline: 0,
    textDecoration: 'none',
    border: 0,
    padding: 0,
    verticalAlign: 'middle',
    position: 'relative',
    transition: 'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
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
      baseStyles.backgroundColor = "#C30045";
      baseStyles.color = "#fff";
    } else if (color === 'secondary') {
      baseStyles.backgroundColor = 'var(--bui-bg-neutral-1, #e0e0e0)';
      baseStyles.color = 'var(--bui-black)';
    } else if (color === 'default') {
      baseStyles.backgroundColor = 'var(--bui-bg-neutral-1, #e0e0e0)';
      baseStyles.color = 'var(--bui-black)';
      baseStyles.color = "#000";
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

const getAvatarStyles = (size: ChipProps['size']): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: size === 'small' ? '20px' : '24px',
  height: size === 'small' ? '20px' : '24px',
  marginLeft: size === 'small' ? '-3px' : '-4px',
  marginRight: size === 'small' ? '3px' : '4px',
  borderRadius: '50%',
  overflow: 'hidden',
});

const getDeleteButtonStyles = (size: ChipProps['size']): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  marginRight: size === 'small' ? '4px' : '5px',
  marginLeft: size === 'small' ? '-4px' : '-6px',
  width: size === 'small' ? '18px' : '22px',
  height: size === 'small' ? '18px' : '22px',
  borderRadius: '50%',
  transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
});

const getDeleteIconStyles = (size: ChipProps['size']): CSSProperties => ({
  width: size === 'small' ? '16px' : '18px',
  height: size === 'small' ? '16px' : '18px',
  fill: 'currentColor',
  opacity: 0.7,
});

export const Chip = forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      label,
      icon,
      deleteIcon,
      onDelete,
      onClick,
      color = 'default',
      textColor = undefined,
      size = 'medium',
      variant = 'filled',
      clickable = false,
      disabled = false,
      className = '',
      style,
      avatar,
    },
    ref
  ) => {
    const isClickable = clickable || !!onClick;
    const isDeletable = !!onDelete;

    const chipStyles = {
      ...getChipStyles(color, textColor, variant, size, isClickable, disabled),
      ...style,
    };

    const content = (
      <>
        {avatar && (
          <span style={getAvatarStyles(size)}>{avatar}</span>
        )}
        {icon && !avatar && (
          <span style={getIconStyles(size)}>{icon}</span>
        )}
        <span style={getLabelStyles(size)}>{label}</span>
        {isDeletable && (
          <Button
            style={getDeleteButtonStyles(size)}
            onPress={onDelete}
            isDisabled={disabled}
            aria-label="Delete"
          >
            {deleteIcon || (
              <svg
                style={getDeleteIconStyles(size)}
                focusable="false"
                aria-hidden="true"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
              </svg>
            )}
          </Button>
        )}
      </>
    );

    if (isClickable && !isDeletable) {
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
  }
);

Chip.displayName = 'Chip';
