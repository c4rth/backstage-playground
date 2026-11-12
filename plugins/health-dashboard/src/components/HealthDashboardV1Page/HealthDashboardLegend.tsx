import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { RiDragMove2Line } from '@remixicon/react';
import { KeyboardEvent, PointerEvent, useEffect, useRef, useState } from 'react';
import { healthDashboardTranslationRef } from '../../translation';
import { OTHER_STATUS_COLOR, STATUS_COLORS } from './HealthProbeCell';
import styles from './HealthDashboardV1Page.module.css';

type Position = { left: number; top: number; width: number };
type Drag = { pointerId: number; x: number; y: number; left: number; top: number };

function constrainPosition(position: Position, rect: DOMRect): Position {
  return {
    ...position,
    left: Math.max(0, Math.min(position.left, window.innerWidth - rect.width)),
    top: Math.max(0, Math.min(position.top, window.innerHeight - rect.height)),
  };
}

export const HealthDashboardLegend = () => {
  const { t } = useTranslationRef(healthDashboardTranslationRef);
  const legendRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const items = [
    { status: '200', label: t('dashboardV1Page.legend.ok'), ...STATUS_COLORS[200] },
    { status: '202', label: t('dashboardV1Page.legend.accepted'), ...STATUS_COLORS[202] },
    { status: '404', label: t('dashboardV1Page.legend.notFound'), ...STATUS_COLORS[404] },
    { status: '503', label: t('dashboardV1Page.legend.unavailable'), ...STATUS_COLORS[503] },
    { status: t('dashboardV1Page.legend.other'), label: t('dashboardV1Page.legend.error'), ...OTHER_STATUS_COLOR },
  ];

  useEffect(() => {
    const handleResize = () => {
      const rect = legendRef.current?.getBoundingClientRect();
      if (rect) {
        setPosition(current => current && constrainPosition(current, rect));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || dragRef.current || !legendRef.current) {
      return;
    }

    const rect = legendRef.current.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: rect.left,
      top: rect.top,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    const rect = legendRef.current?.getBoundingClientRect();
    if (!drag || drag.pointerId !== event.pointerId || !rect) {
      return;
    }
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (dx === 0 && dy === 0) {
      return;
    }
    setPosition(constrainPosition({
      left: drag.left + dx,
      top: drag.top + dy,
      width: rect.width,
    }, rect));
  };

  const handlePointerEnd = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const offsets: Record<string, [number, number]> = {
      ArrowLeft: [-10, 0],
      ArrowRight: [10, 0],
      ArrowUp: [0, -10],
      ArrowDown: [0, 10],
    };
    const offset = offsets[event.key];
    const rect = legendRef.current?.getBoundingClientRect();
    if (!offset || !rect) {
      return;
    }
    event.preventDefault();
    setPosition(constrainPosition({
      left: rect.left + offset[0],
      top: rect.top + offset[1],
      width: rect.width,
    }, rect));
  };

  return (
    <div
      ref={legendRef}
      className={styles.legend}
      aria-label={t('dashboardV1Page.legend.label')}
      data-moved={position ? true : undefined}
      style={position ? {
        left: position.left,
        top: position.top,
        width: position.width,
      } : undefined}
    >
      <button
        type="button"
        className={styles.legendHandle}
        aria-label={t('dashboardV1Page.legend.move')}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onLostPointerCapture={handlePointerEnd}
        onKeyDown={handleKeyDown}
      >
        {t('dashboardV1Page.legend.title')}
        <RiDragMove2Line size={16} aria-hidden="true" />
      </button>
      {items.map(({ status, label, color }) => (
        <div key={status} className={styles.legendItem}>
          <span
            className={styles.legendBullet}
            style={{ backgroundColor: color }}
          />
          {t('dashboardV1Page.legend.item', { label, status })}
        </div>
      ))}
    </div>
  );
};
