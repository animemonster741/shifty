import { getDay, setHours, setMinutes, setSeconds, addDays, startOfWeek } from 'date-fns';

interface ApprovalResult {
  requiresApproval: boolean;
  reason?: 'duration' | 'weekend_exception';
}

/**
 * Determines if an alert requires manager approval based on:
 * 1. Duration Rule: Any alert > 48 hours requires approval
 * 2. Weekend Exception: Alerts created Wed 17:00 - Sun 08:00 that expire by Sun 08:00 don't need approval
 * 
 * @param createdAt - When the alert is being created (usually now)
 * @param ignoreUntil - The expiration date of the alert
 * @returns Object with requiresApproval boolean and reason
 */
export function checkApprovalRequired(createdAt: Date, ignoreUntil: Date): ApprovalResult {
  const durationMs = ignoreUntil.getTime() - createdAt.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  
  // If duration is 48 hours or less, no approval needed
  if (durationHours <= 48) {
    return { requiresApproval: false };
  }
  
  // Check weekend exception
  if (isWithinWeekendWindow(createdAt, ignoreUntil)) {
    return { requiresApproval: false, reason: 'weekend_exception' };
  }
  
  // Duration > 48h and not in weekend exception
  return { requiresApproval: true, reason: 'duration' };
}

/**
 * Checks if the alert falls within the weekend exception window:
 * - Created between Wednesday 17:00 and Sunday 08:00
 * - Expires no later than Sunday 08:00
 */
function isWithinWeekendWindow(createdAt: Date, ignoreUntil: Date): boolean {
  const dayOfWeek = getDay(createdAt); // 0 = Sunday, 3 = Wednesday
  const hour = createdAt.getHours();
  
  // Get the relevant Sunday at 08:00
  // We need to find the next Sunday 08:00 from the creation time
  const nextSunday = getNextSundayAt0800(createdAt);
  
  // Check if creation time is within the window
  const isInCreationWindow = isWithinCreationWindow(dayOfWeek, hour);
  
  // Check if expiration is before or at Sunday 08:00
  const expiresBeforeSundayMorning = ignoreUntil.getTime() <= nextSunday.getTime();
  
  return isInCreationWindow && expiresBeforeSundayMorning;
}

/**
 * Check if the day/hour combination falls within Wed 17:00 - Sun 08:00
 */
function isWithinCreationWindow(dayOfWeek: number, hour: number): boolean {
  // Wednesday (3) from 17:00 onwards
  if (dayOfWeek === 3 && hour >= 17) return true;
  
  // Thursday (4), Friday (5), Saturday (6) - all day
  if (dayOfWeek >= 4 && dayOfWeek <= 6) return true;
  
  // Sunday (0) before 08:00
  if (dayOfWeek === 0 && hour < 8) return true;
  
  return false;
}

/**
 * Gets the next Sunday at 08:00 from a given date.
 * If currently in the window (Wed 17:00 - Sun 08:00), returns the upcoming Sunday.
 */
function getNextSundayAt0800(date: Date): Date {
  const dayOfWeek = getDay(date);
  
  let daysUntilSunday: number;
  
  if (dayOfWeek === 0) {
    // It's Sunday - if before 08:00, use this Sunday; otherwise use next Sunday
    const hour = date.getHours();
    if (hour < 8) {
      daysUntilSunday = 0;
    } else {
      daysUntilSunday = 7;
    }
  } else {
    // Days until next Sunday
    daysUntilSunday = 7 - dayOfWeek;
  }
  
  const sunday = addDays(date, daysUntilSunday);
  return setSeconds(setMinutes(setHours(sunday, 8), 0), 0);
}

/**
 * Get human-readable reason for approval requirement
 */
export function getApprovalReasonText(reason: 'duration' | 'weekend_exception', isHebrew: boolean): string {
  if (reason === 'weekend_exception') {
    return isHebrew ? 'אישור אוטומטי (נוהל סופ"ש)' : 'Automatic approval (Weekend rule)';
  }
  return isHebrew ? 'משך מעל 48 שעות' : 'Duration over 48 hours';
}
