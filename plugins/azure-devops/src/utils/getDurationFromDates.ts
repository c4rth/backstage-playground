import { DateTime, Interval } from 'luxon';
import humanizeDuration from 'humanize-duration';

export const getDurationFromDates = (
  startTime?: string,
  finishTime?: string,
): string => {
  if (!startTime || (!startTime && !finishTime)) {
    return '';
  }

  const start = DateTime.fromISO(startTime);
  const finish = finishTime ? DateTime.fromISO(finishTime) : DateTime.now();

  const formatted = Interval.fromDateTimes(start, finish)
    .toDuration()
    .valueOf();

  const shortEnglishHumanizer = humanizeDuration.humanizer({
    language: 'shortEn',
    languages: {
      shortEn: {
        y: () => 'y',
        mo: () => 'mo',
        w: () => 'w',
        d: () => 'd',
        h: () => 'h',
        m: () => 'm',
        s: () => 's',
        ms: () => 'ms',
      },
    },
  });

  return shortEnglishHumanizer(formatted, {
    largest: 2,
    round: true,
    spacer: '',
  });
};
