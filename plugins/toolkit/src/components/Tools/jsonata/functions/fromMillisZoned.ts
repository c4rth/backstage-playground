import jsonata from 'jsonata';

// Converts an IANA timezone name (e.g. 'Europe/Brussels') to a UTC offset string
// in +HHMM format (e.g. '+0100') as expected by JSONata's built-in $fromMillis.
const ianaToUtcOffset = (ms: number, timezone: string): string => {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    timeZoneName: 'longOffset',
  }).formatToParts(new Date(ms));
  const tzName = parts.find(p => p.type === 'timeZoneName')?.value;
  if (!tzName || tzName === 'GMT') return '+0000';
  const m = tzName.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!m) return '+0000';
  return `${m[1]}${m[2]}${m[3]}`;
};

// $fromMillisZoned accepts an IANA timezone name and converts it to a UTC offset
// before delegating to JSONata's built-in $fromMillis(ms, picture, offset).
export const fromMillisZoned = async (
  ms: number,
  picture: string,
  timezone: string,
): Promise<string> => {
  const offset = ianaToUtcOffset(ms, timezone);
  return jsonata(`$fromMillis(${ms}, "${picture}", "${offset}")`).evaluate(
    {},
  ) as Promise<string>;
};
