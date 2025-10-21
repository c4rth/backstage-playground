import { ReactNode } from 'react';
import styles from './styles.module.css';

export const Chip = ({
  children,
  head = false,
  backgroundColor
}: {
  children: ReactNode;
  head?: boolean;
  backgroundColor?: string;
}) => {
  return (
    <span className={`${styles.chip} ${head ? styles.head : ''}`} style={{ backgroundColor }}>
      {children}
    </span>
  );
};
