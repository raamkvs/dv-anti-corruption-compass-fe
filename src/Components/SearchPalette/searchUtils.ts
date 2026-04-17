import { SearchItem, SearchItemCategory } from './types';

const CATEGORY_ORDER: SearchItemCategory[] = [
  'page',
  'indicator',
  'sub-indicator',
  'country',
];

const MAX_RESULTS_PER_CATEGORY = 5;

function scoreItem(item: SearchItem, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  const label = item.label.toLowerCase();

  if (label === q) return 100;
  if (label.startsWith(q)) return 80;
  if (item.keywords.some(k => k.startsWith(q))) return 60;
  if (label.includes(q)) return 40;
  if (item.keywords.some(k => k.includes(q))) return 20;

  return 0;
}

export interface GroupedResults {
  category: SearchItemCategory;
  label: string;
  items: SearchItem[];
}

const CATEGORY_LABELS: Record<SearchItemCategory, string> = {
  page: 'Pages',
  indicator: 'Indicators',
  'sub-indicator': 'Sub-indicators',
  country: 'Countries',
};

export function searchItems(
  items: SearchItem[],
  query: string,
): GroupedResults[] {
  const q = query.trim();
  if (!q) return [];

  const scored = items
    .map(item => ({ item, score: scoreItem(item, q) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  const byCategory = new Map<SearchItemCategory, SearchItem[]>();

  for (const { item } of scored) {
    const bucket = byCategory.get(item.category) ?? [];
    if (bucket.length < MAX_RESULTS_PER_CATEGORY) {
      bucket.push(item);
      byCategory.set(item.category, bucket);
    }
  }

  return CATEGORY_ORDER.filter(cat => byCategory.has(cat)).map(cat => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: byCategory.get(cat)!,
  }));
}
