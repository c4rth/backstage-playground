import type { CSSProperties, SVGProps } from 'react';

export interface AzureDevOpsIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  style?: CSSProperties;
}

export const AzureDevOpsIcon = ({
  size = 24,
  color = 'currentColor',
  style,
  ...props
}: AzureDevOpsIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width={size}
    height={size}
    fill={color}
    style={style}
    {...props}
  >
    <path d="M15 3.622v8.512L11.5 15l-5.425-1.975v1.958L3.004 10.97l8.951.7V4.005L15 3.622zm-2.984.428L6.994 1v2.001L2.382 4.356 1 6.13v4.029l1.978.873V5.869l9.038-1.818z" />
  </svg>
);
