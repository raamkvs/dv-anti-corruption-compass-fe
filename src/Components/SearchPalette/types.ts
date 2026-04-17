export type SearchItemCategory = 'page' | 'indicator' | 'sub-indicator' | 'country';

export interface SearchItem {
  id: string;
  category: SearchItemCategory;
  label: string;
  description?: string;
  keywords: string[];
  to: string;
  params?: Record<string, string>;
}
