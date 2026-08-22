import { ProgressBar } from 'react-aria-components';

interface ProgressProps {
  ariaLabel?: string;
}

export const Progress = ({ ariaLabel = 'Loading' }: ProgressProps) => {
  return (
    <ProgressBar
      isIndeterminate
      aria-label={ariaLabel}
      style={{ width: '100%' }}
    >
      {/* Track */}
      <div
        style={{
          position: 'relative',
          height: '4px',
          width: '100%',
          overflow: 'hidden',
          borderRadius: '2px',
          backgroundColor:
            'color-mix(in srgb, var(--bui-accent-bg) 20%, transparent)',
        }}
      >
        {/* Animated Fill Bar */}
        <div
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            borderRadius: '2px',
            backgroundColor: 'var(--bui-accent-bg)',
            transformOrigin: 'left',
            animation: 'buiIndeterminate 1.5s infinite linear',
          }}
        />

        {/* Embedded Keyframes */}
        <style>{`
          @keyframes buiIndeterminate {
            0% {
              transform: translateX(-100%) scaleX(0.2);
            }
            50% {
              transform: translateX(0%) scaleX(0.5);
            }
            100% {
              transform: translateX(100%) scaleX(0.2);
            }
          }
        `}</style>
      </div>
    </ProgressBar>
  );
};
