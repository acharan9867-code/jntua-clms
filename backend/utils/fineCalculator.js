/**
 * JNTUA Central Library Management System (CLMS)
 * Authoritative Fine, Overdue & Due-Date Calculation Engine
 */

export const BORROWING_PERIOD_DAYS = 15;
export const FINE_PER_DAY_INR = 1.0;
export const LOST_DAMAGED_CHARGE_INR = 300.0;

/**
 * Calculates due date given an issue date (exact 15 days).
 * @param {Date|string} issueDate
 * @returns {Date}
 */
export function calculateDueDate(issueDate) {
  const date = new Date(issueDate);
  date.setDate(date.getDate() + BORROWING_PERIOD_DAYS);
  return date;
}

/**
 * Formats a Date object to YYYY-MM-DD HH:mm:ss for consistent DB storage.
 * @param {Date} date
 * @returns {string}
 */
export function formatDbDate(date = new Date()) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * Calculates overdue days and dynamic fine.
 * @param {Date|string} dueDate 
 * @param {Date|string} [returnDate] Defaults to current date/time
 * @returns {{ overdueDays: number, fineAmount: number, isOverdue: boolean, daysRemaining: number }}
 */
export function calculateFine(dueDate, returnDate = new Date()) {
  const due = new Date(dueDate);
  const ret = new Date(returnDate);

  // Normalize to day boundaries for fair, predictable library calculations
  const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const retMidnight = new Date(ret.getFullYear(), ret.getMonth(), ret.getDate()).getTime();

  const diffTime = retMidnight - dueMidnight;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    // Returned on or before due date
    return {
      overdueDays: 0,
      fineAmount: 0.0,
      isOverdue: false,
      daysRemaining: Math.max(0, -diffDays)
    };
  }

  // Returned after due date: ₹1 per day overdue
  const fineAmount = Number((diffDays * FINE_PER_DAY_INR).toFixed(2));

  return {
    overdueDays: diffDays,
    fineAmount,
    isOverdue: true,
    daysRemaining: 0
  };
}

/**
 * Calculates lost or damaged penalty and total payable.
 * Rule: ₹300 fixed replacement/damage charge + applicable late fine.
 * @param {Date|string} dueDate
 * @param {Date|string} [reportDate]
 * @returns {{ overdueDays: number, lateFine: number, lostDamagedCharge: number, totalPayable: number }}
 */
export function calculateLostDamagedFee(dueDate, reportDate = new Date()) {
  const { overdueDays, fineAmount } = calculateFine(dueDate, reportDate);
  const lostDamagedCharge = LOST_DAMAGED_CHARGE_INR;
  const totalPayable = Number((lostDamagedCharge + fineAmount).toFixed(2));

  return {
    overdueDays,
    lateFine: fineAmount,
    lostDamagedCharge,
    totalPayable
  };
}
