const isDev =
  typeof import.meta !== 'undefined' &&
  (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true;

const now =
  typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? () => performance.now()
    : () => Date.now();

type TimelineState = {
  name: string;
  start: number;
  last: number;
};

let currentTimeline: TimelineState | null = null;

/** Start a new UI timeline (e.g. homepage load). Subsequent phases use logTimelinePhase/endTimeline. */
export function startTimeline(name: string): void {
  if (!isDev) return;
  const t = now();
  currentTimeline = { name, start: t, last: t };
  console.warn(`[Timeline] ${name}: START (t=${t.toFixed(1)}ms)`);
}

/** Log a phase within the current UI timeline. */
export function logTimelinePhase(phase: string): void {
  if (!isDev || !currentTimeline) return;
  const t = now();
  const { name, start, last } = currentTimeline;
  const fromStart = t - start;
  const fromPrev = t - last;
  currentTimeline.last = t;
  console.warn(
    `[Timeline] ${name}: ${phase} (+${fromStart.toFixed(
      1,
    )}ms from start, +${fromPrev.toFixed(1)}ms from prev)`,
  );
}

/** End the current UI timeline. */
export function endTimeline(finalPhase = 'complete'): void {
  if (!isDev || !currentTimeline) return;
  const t = now();
  const { name, start } = currentTimeline;
  const total = t - start;
  console.warn(
    `[Timeline] ${name}: END (${finalPhase}) total=${total.toFixed(1)}ms`,
  );
  currentTimeline = null;
}

type ResourceSummaryOptions = {
  minDurationMs?: number;
  limit?: number;
};

/**
 * Log a summary of the slowest loaded resources (scripts, CSS, images, XHR/fetch)
 * so you can see which assets cost the most time on the homepage.
 */
export function logResourceSummary(
  label: string,
  options: ResourceSummaryOptions = {},
): void {
  if (
    !isDev ||
    typeof performance === 'undefined' ||
    typeof performance.getEntriesByType !== 'function'
  )
    return;

  const { minDurationMs = 50, limit = 20 } = options;
  const entries = performance.getEntriesByType(
    'resource',
  ) as PerformanceResourceTiming[];

  const slowest = entries
    .filter(e => e.duration >= minDurationMs)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, limit);

  if (!slowest.length) {
    console.warn(
      `[Resources] ${label}: no resources slower than ${minDurationMs}ms`,
    );
    return;
  }

  console.warn(
    `[Resources] ${label}: top ${slowest.length} resources >= ${minDurationMs}ms`,
  );
  slowest.forEach(e => {
    const size =
      'transferSize' in e && typeof e.transferSize === 'number'
        ? `${(e.transferSize / 1024).toFixed(1)}KB`
        : 'n/a';
    console.warn(
      `[Resources] ${label}: ${e.initiatorType} ${e.name} duration=${e.duration.toFixed(
        1,
      )}ms size=${size}`,
    );
  });
}
