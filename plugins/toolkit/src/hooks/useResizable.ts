import { useCallback, useRef, useState } from 'react';

export const useResizable = (
  direction: 'horizontal' | 'vertical',
  initialPercentage: number, // 0 to 100
  containerRef: React.RefObject<HTMLDivElement | null>,
  minPercentage = 15,
  maxPercentage = 85,
) => {
  const [percentage, setPercentage] = useState(initialPercentage);
  const dragging = useRef(false);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      document.body.style.userSelect = 'none';
      document.body.style.cursor =
        direction === 'horizontal' ? 'col-resize' : 'row-resize';

      const move = (ev: MouseEvent) => {
        if (!dragging.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        let p: number;

        if (direction === 'horizontal') {
          p = ((ev.clientX - rect.left) / rect.width) * 100;
        } else {
          p = ((ev.clientY - rect.top) / rect.height) * 100;
        }

        setPercentage(Math.min(maxPercentage, Math.max(minPercentage, p)));
      };

      const up = () => {
        dragging.current = false;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };

      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    },
    [direction, containerRef, minPercentage, maxPercentage],
  );

  return { percentage, onMouseDown };
};
