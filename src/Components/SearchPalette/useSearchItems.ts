import { useMemo } from 'react';

import { useGlobalDataContext } from '@/App';
import { SearchItem } from './types';

const STATIC_PAGES: SearchItem[] = [
  {
    id: 'page-home',
    category: 'page',
    label: 'Home',
    description: 'Overview of anti-corruption indicators and globe',
    keywords: [
      'home',
      'homepage',
      'overview',
      'globe',
      'introduction',
      'explore',
      'start',
      'corruption',
    ],
    to: '/',
  },
  {
    id: 'page-countries',
    category: 'page',
    label: 'Country Profile',
    description: 'Browse and explore all available countries',
    keywords: [
      'countries',
      'country list',
      'browse',
      'all countries',
      'country profile',
      'country insights',
    ],
    to: '/countries',
  },
  {
    id: 'page-methodology',
    category: 'page',
    label: 'Methodology',
    description:
      'How data is collected and measured for each indicator',
    keywords: [
      'methodology',
      'methods',
      'how it works',
      'data collection',
      'measurement',
      'procurement methodology',
      'enterprise survey methodology',
      'approach',
      'framework',
    ],
    to: '/methodology',
  },
  {
    id: 'page-about',
    category: 'page',
    label: 'About Us',
    description:
      "About UNDP's Global Anti-Corruption Measurement Initiative",
    keywords: [
      'about',
      'about us',
      'undp',
      'initiative',
      'anti-corruption programme',
      'dashboard',
      'mission',
      'global initiative',
      'partnership',
      'unodc',
      'iaca',
    ],
    to: '/about',
  },
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,.\-/]+/)
    .filter(t => t.length > 2);
}

export function useSearchItems(): SearchItem[] {
  const { indicatorsMetaData, countriesListData } = useGlobalDataContext();

  return useMemo(() => {
    const items: SearchItem[] = [...STATIC_PAGES];

    for (const indicator of indicatorsMetaData) {
      const slug = indicator.name.replaceAll(' ', '-').toLowerCase();
      const indicatorKeywords = Array.from(
        new Set([
          indicator.name.toLowerCase(),
          ...tokenize(indicator.name),
          ...tokenize(indicator.description || ''),
        ]),
      );

      items.push({
        id: `indicator-${indicator.mainIndicatorId}`,
        category: 'indicator',
        label: indicator.name,
        description: indicator.description,
        keywords: indicatorKeywords,
        to: '/main-indicators/{-$indicator}',
        params: { indicator: slug },
      });

      for (const sub of indicator.subIndicators) {
        const subKeywords = Array.from(
          new Set([
            sub.name.toLowerCase(),
            ...tokenize(sub.name),
            ...tokenize(sub.description || ''),
            indicator.name.toLowerCase(),
          ]),
        );

        items.push({
          id: `sub-${sub.subIndicatorId}`,
          category: 'sub-indicator',
          label: sub.name,
          description: `${indicator.name} · ${sub.description}`,
          keywords: subKeywords,
          to: '/main-indicators/{-$indicator}',
          params: { indicator: slug },
        });
      }
    }

    for (const country of countriesListData) {
      const name = country['Country or Area (official name)'];
      const iso = country['Alpha-3 code'];
      items.push({
        id: `country-${iso}`,
        category: 'country',
        label: name,
        description: `${country['Group 1']}${country['Group 2'] ? ` · ${country['Group 2']}` : ''}`,
        keywords: [name.toLowerCase(), iso.toLowerCase(), ...tokenize(name)],
        to: '/countries/$isoCode/{-$indicator}',
        params: { isoCode: iso },
      });
    }

    return items;
  }, [indicatorsMetaData, countriesListData]);
}
