// Custom week calculation for Sunday-Thursday business weeks
export function customYearWeek(date: Date) {
  // Create a new UTC date to avoid modifying the original and timezone issues
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  
  // For Sunday-Thursday weeks, we need to adjust the calculation
  // Sunday = 0, Monday = 1, ..., Saturday = 6
  const dayOfWeek = d.getUTCDay(); // 0 = Sunday, 6 = Saturday
  
  // For Sunday-Thursday weeks:
  // - If it's Sunday-Thursday (0-4), it belongs to the current week
  // - If it's Friday-Saturday (5-6), it belongs to the next week
  
  // Adjust date to the reference day (Wednesday) for week calculation
  // Wednesday is in the middle of Sunday-Thursday week
  let adjustedDate = new Date(d);
  if (dayOfWeek <= 4) { // Sunday to Thursday
    // Move to Wednesday of the same week
    adjustedDate.setUTCDate(d.getUTCDate() + (3 - dayOfWeek));
  } else { // Friday or Saturday
    // Move to Wednesday of the next week
    adjustedDate.setUTCDate(d.getUTCDate() + (3 - dayOfWeek + 7));
  }
  
  const year = adjustedDate.getUTCFullYear();
  
  // Get January 1st of this year
  const jan1 = new Date(Date.UTC(year, 0, 1));
  
  // Find the first Wednesday of the year (reference point for week 1)
  const jan1Day = jan1.getUTCDay(); // 0 = Sunday, 6 = Saturday
  const firstWednesday = new Date(jan1);
  if (jan1Day <= 3) { // Jan 1 is Sunday-Wednesday
    firstWednesday.setUTCDate(jan1.getUTCDate() + (3 - jan1Day));
  } else { // Jan 1 is Thursday-Saturday
    firstWednesday.setUTCDate(jan1.getUTCDate() + (3 - jan1Day + 7));
  }
  
  // Calculate the number of days between this Wednesday and the first Wednesday
  const daysDiff = Math.floor((adjustedDate.getTime() - firstWednesday.getTime()) / (24 * 60 * 60 * 1000));
  
  // Calculate the week number
  const week = Math.floor(daysDiff / 7) + 1;
  
  console.log('customYearWeek calculation:', {
    inputDate: date.toISOString().split('T')[0],
    dayOfWeek,
    adjustedDate: adjustedDate.toISOString().split('T')[0],
    year,
    firstWednesday: firstWednesday.toISOString().split('T')[0],
    daysDiff,
    week
  });
  
  return { year, week };
}

// Get the Sunday (start) of a specific custom week
export function getSundayOfCustomWeek(year: number, week: number): Date {
  // Get January 1st of the year
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const jan1Day = jan1.getUTCDay(); // 0 = Sunday, 6 = Saturday
  
  // Find the first Wednesday of the year (reference point for week 1)
  const firstWednesday = new Date(jan1);
  if (jan1Day <= 3) { // Jan 1 is Sunday-Wednesday
    firstWednesday.setUTCDate(jan1.getUTCDate() + (3 - jan1Day));
  } else { // Jan 1 is Thursday-Saturday
    firstWednesday.setUTCDate(jan1.getUTCDate() + (3 - jan1Day + 7));
  }
  
  // Calculate the Wednesday of the target week
  const targetWednesday = new Date(firstWednesday);
  targetWednesday.setUTCDate(firstWednesday.getUTCDate() + (week - 1) * 7);
  
  // Get the Sunday of that week (3 days before Wednesday)
  const targetSunday = new Date(targetWednesday);
  targetSunday.setUTCDate(targetWednesday.getUTCDate() - 3);
  
  console.log('getSundayOfCustomWeek:', {
    year,
    week,
    jan1: jan1.toISOString().split('T')[0],
    jan1Day,
    firstWednesday: firstWednesday.toISOString().split('T')[0],
    targetWednesday: targetWednesday.toISOString().split('T')[0],
    targetSunday: targetSunday.toISOString().split('T')[0]
  });
  
  return targetSunday;
}

// Label helper: Sunday date -> "Wxx-YYYY" (Custom)
export function customWeekKeyFromDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00Z');
  const { year, week } = customYearWeek(d);
  return `W${String(week).padStart(2, '0')}-${year}`;
}

// Parse "W43-2025", "2025-W43", or "YYYY-MM-DD" (Sunday date).
// If it's a date, compute custom week directly from the Sunday date.
export function parseWeekKeyToCustom(key: string) {
  const k = key.trim().toUpperCase();

  let m = k.match(/^W(\d{1,2})-(\d{4})$/);      // W43-2025
  if (m) return { customWeek: +m[1], customYear: +m[2] };

  m = k.match(/^(\d{4})-W(\d{1,2})$/);          // 2025-W43
  if (m) return { customWeek: +m[2], customYear: +m[1] };

  m = key.match(/^\d{4}-\d{2}-\d{2}$/);           // 2025-10-19 (keep original case)
  if (m) {
    const { year, week } = customYearWeek(new Date(key + 'T00:00:00Z'));
    return { customYear: year, customWeek: week };
  }

  throw new Error(`Invalid week key: ${key}`);
}

// Legacy ISO functions for backward compatibility (but now using custom week logic)
export function isoYearWeek(date: Date) {
  return customYearWeek(date);
}

export function getMondayOfISOWeek(year: number, week: number): Date {
  // For Sunday-Thursday weeks, return the Sunday (start of week)
  return getSundayOfCustomWeek(year, week);
}

export function isoWeekKeyFromDate(dateStr: string) {
  return customWeekKeyFromDate(dateStr);
}

export function parseWeekKeyToIso(key: string) {
  const result = parseWeekKeyToCustom(key);
  return { isoYear: result.customYear, isoWeek: result.customWeek };
}