// UTC-safe helpers for ISO week
export function isoYearWeekKey(dInput: string | Date) {
  const d = typeof dInput === 'string' ? new Date(dInput + 'T00:00:00Z') : dInput;
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = (dt.getUTCDay() + 6) % 7;        // Mon=0..Sun=6
  dt.setUTCDate(dt.getUTCDate() - day + 3);    // Thursday
  const isoYear = dt.getUTCFullYear();
  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  const jan4Day = (jan4.getUTCDay() + 6) % 7;
  const firstThu = new Date(jan4);
  firstThu.setUTCDate(jan4.getUTCDate() - jan4Day + 3);
  const isoWeek = 1 + Math.round((dt.getTime() - firstThu.getTime()) / 604800000);
  return `W${String(isoWeek).padStart(2, '0')}-${isoYear}`;
}

export function parseWeekKey(key: string) {
  const k = key.toUpperCase();
  const m = k.match(/^W?(\d{1,2})-(\d{4})$/);
  if (!m) throw new Error(`Invalid week key: ${key}`);
  return { isoWeek: Number(m[1]), isoYear: Number(m[2]) };
}

// Get Monday of the week for a given date (ISO week start)
export const getMondayOfWeek = (date: Date) => {
  // Use UTC to avoid timezone issues
  const monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = monday.getUTCDay() || 7; // Convert Sunday (0) to 7
  const diff = monday.getUTCDate() - day + 1; // Monday is day 1
  monday.setUTCDate(diff);
  return monday;
};

export const getMondayOfWeekISO = (weekNumber: number, year: number) => {
  // Use UTC to ensure consistency with isoYearWeek function
  const jan4 = new Date(Date.UTC(year, 0, 4)); // January 4th is always in week 1
  const jan4Day = jan4.getUTCDay() || 7; // Convert Sunday (0) to 7
  const firstMonday = new Date(jan4);
  firstMonday.setUTCDate(jan4.getUTCDate() - jan4Day + 1); // Get to Monday of week 1
  
  const targetMonday = new Date(firstMonday);
  targetMonday.setUTCDate(firstMonday.getUTCDate() + (weekNumber - 1) * 7);
  
  return targetMonday;
};