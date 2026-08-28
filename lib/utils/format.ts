const MONTH_YEAR = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });
const DAY_MONTH = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const FULL_DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function parse(date: string | null | undefined): Date | null {
  if (!date) return null;
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** "Aug 12–20, 2026" or "Aug 2026" when only one bound is known. */
export function formatDateRange(start?: string | null, end?: string | null): string | null {
  const from = parse(start);
  const to = parse(end);
  if (!from && !to) return null;
  if (from && !to) return FULL_DATE.format(from);
  if (!from && to) return FULL_DATE.format(to);
  if (from && to) {
    const sameYear = from.getUTCFullYear() === to.getUTCFullYear();
    const sameMonth = sameYear && from.getUTCMonth() === to.getUTCMonth();
    if (sameMonth) {
      return `${DAY_MONTH.format(from)}–${to.getUTCDate()}, ${to.getUTCFullYear()}`;
    }
    if (sameYear) {
      return `${DAY_MONTH.format(from)} – ${DAY_MONTH.format(to)}, ${to.getUTCFullYear()}`;
    }
    return `${FULL_DATE.format(from)} – ${FULL_DATE.format(to)}`;
  }
  return null;
}

export function formatMonthYear(date?: string | null): string | null {
  const parsed = parse(date);
  return parsed ? MONTH_YEAR.format(parsed) : null;
}

export function formatFullDate(date?: string | null): string | null {
  const parsed = parse(date);
  return parsed ? FULL_DATE.format(parsed) : null;
}

/** Inclusive day count between two ISO dates, e.g. "8 days". */
export function formatDuration(start?: string | null, end?: string | null): string | null {
  const from = parse(start);
  const to = parse(end);
  if (!from || !to) return null;
  const days = Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
  if (days < 1) return null;
  return days === 1 ? "1 day" : `${days} days`;
}

export function tripDurationDays(start?: string | null, end?: string | null): number | null {
  const from = parse(start);
  const to = parse(end);
  if (!from || !to) return null;
  return Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
}

const LABELS: Record<string, string> = {
  "road-trip": "Road trip",
  trek: "Trek",
  backpacking: "Backpacking",
  family: "Family",
  solo: "Solo",
  weekend: "Weekend",
  easy: "Easy",
  moderate: "Moderate",
  hard: "Hard",
  spring: "Spring",
  summer: "Summer",
  monsoon: "Monsoon",
  autumn: "Autumn",
  winter: "Winter",
};

export function label(value?: string | null): string | null {
  if (!value) return null;
  return LABELS[value] ?? value;
}
