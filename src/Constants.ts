import { cn } from '@undp/design-system-react/cn';

/** Base URL for Anti-Corruption API */
export const API_BASE_URL = 'https://app.anti-corruption.org/api';

/**
 * Page size for Facts API. Large values increase payload size and load time.
 * Homepage uses getAllCountriesAllData (no filters) → largest response.
 * Reduce if backend supports pagination (e.g. pageNumber) or a summary endpoint.
 */
export const FACTS_API_PAGE_SIZE = 10000;

/** Smaller page size for heavily filtered Facts (e.g. regional) where result set is small */
export const FACTS_API_PAGE_SIZE_SMALL = 1000;

const isDev =
  typeof import.meta !== 'undefined' &&
  (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true;

const perfNow =
  typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? () => performance.now()
    : () => Date.now();

/** Log duration for Indicators / Countries metadata fetches in development. */
export function logGlobalApiTiming(label: string, durationMs: number): void {
  if (!isDev) return;
  console.warn(`[Global API] ${label}: ${durationMs.toFixed(0)}ms`);
}

export function logGlobalApiTimingStart(): number {
  return perfNow();
}

export function logGlobalApiTimingEnd(label: string, start: number): void {
  logGlobalApiTiming(label, perfNow() - start);
}

/** Log Facts API response size in development to diagnose slow loading */
export function logFactsPayloadSize(label: string, data: unknown): void {
  if (isDev && Array.isArray(data)) {
    const bytes = new Blob([JSON.stringify(data)]).size;
    const mb = (bytes / 1024 / 1024).toFixed(2);
    console.warn(`[Facts API] ${label}: ${data.length} items, ~${mb} MB`);
  }
}

/** Log start time for a Facts API request in development. Returns a token for logFactsLoadEnd. */
export function logFactsLoadStart(label: string): number | null {
  if (!isDev) return null;
  const start =
    typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
  console.warn(`[Facts API] START ${label} at ${new Date().toISOString()}`);
  return start;
}

/** Log end time and duration for a Facts API request in development. */
export function logFactsLoadEnd(label: string, start: number | null): void {
  if (!isDev || start == null) return;
  const end =
    typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
  const durationMs = end - start;
  console.warn(
    `[Facts API] END ${label} at ${new Date().toISOString()} (+${durationMs.toFixed(
      0,
    )} ms)`,
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DROPDOWN_CLASSNAMES: any = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  singleValue: (state: any) =>
    cn(
      'text-base text-primary-gray-700!',
      state.isDisabled ? 'text-primary-gray-500!' : 'text-primary-gray-700!',
    ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  option: (state: any) =>
    cn(
      'bg-[#fff]! poppins-regular text-[#2D4858]! py-4! text-base hover:bg-[#4B6E91]! hover:text-[var(--color-text-white)]!',
      state.isSelected
        ? 'bg-primary-gray-100! text-primary-gray-700 font-bold'
        : 'bg-primary-white',
      state.isFocused
        ? 'bg-primary-gray-100! text-primary-gray-700'
        : 'bg-primary-white',
    ),
  placeholder: () =>
    'text-primary-gray-550! dark:text-primary-gray-400! text-base',
  group: () => 'py-0!',
  groupHeading: () =>
    'poppins-bold! text-base! normal-case! py-[12px]! m-0! text-primary-gray-700! bg-transparent! font-bold!',
  input: () => 'text-base',
  valueContainer: () => 'px-2 py-[2px]',
  menu: () => 'mt-1! border-0! shadow-lg! bg-primary-white! rounded-[8px]!',
  menuList: () => 'rounded-[8px]! !p-0 !m-0',
  indicatorSeparator: () => '!hidden',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DROPDOWN_CLASSNAMES_MULTI_SELECT: any = {
  ...DROPDOWN_CLASSNAMES,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  option: (state: any) =>
    cn(
      'bg-transparent poppins-regular text-base hover:bg-primary-gray-300! text-primary-gray-700!',
      state.isSelected ? 'bg-primary-gray-100! font-bold' : '',
      state.isFocused
        ? 'bg-primary-gray-100! text-primary-gray-700'
        : 'bg-primary-white',
    ),
  input: () => 'text-base undp-select-input px-0!',
};
