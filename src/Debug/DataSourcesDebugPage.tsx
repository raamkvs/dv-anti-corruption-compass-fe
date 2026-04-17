import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Spacer } from '@undp/design-system-react/Spacer';
import { getCountryDetailsFromISO3 } from '@undp-data/data-utils';
import { useQuery } from '@tanstack/react-query';

import { API_BASE_URL } from '@/Constants';
import { getFactsPage } from '@/QueryFn/getFactsPage';
import { getIndicatorsMetaData } from '@/QueryFn/getIndicatorsMetaData';
import { getCountriesList } from '@/QueryFn/getCountriesList';
import { HeadingText, ParagraphText } from '@/Components/Typography';
import {
  CountriesFromApiDataType,
  CountriesDataType,
  IndicatorsMetaDataType,
} from '@/Types';

const INDICATORS_URL = 'https://app.anti-corruption.org/api/Indicators';
const COUNTRIES_URL = 'https://app.anti-corruption.org/api/Countries/';

type ApiBlock = {
  title: string;
  apiUrl: string;
  functionName: string;
  chain: string;
  uiUsage: string;
  exampleNote: string;
};

const DATA_FLOW_ROWS: ApiBlock[] = [
  {
    title: 'Indicators metadata',
    apiUrl: INDICATORS_URL,
    functionName: 'getIndicatorsMetaData',
    chain:
      'HTTP GET → getIndicatorsMetaData → useQuery in useGlobalData (App.tsx) → GlobalDataContext → Index route → Homepage → HomepageEl (pillar names, colors, sub-indicators) → GlobeComponent (colors, fog), charts, navigation',
    uiUsage:
      'Defines pillar tabs, sub-indicator chips, globe accent colors, and which indicators exist.',
    exampleNote:
      'Array of pillars; each has subIndicators with id like "3_12", colors, names.',
  },
  {
    title: 'Countries list',
    apiUrl: COUNTRIES_URL,
    functionName: 'getCountriesList',
    chain:
      'HTTP GET → getCountriesList → useQuery → enriched via getCountryDetailsFromISO3 → GlobalDataContext → Homepage → HomepageEl → GlobeComponent tooltip names, CountryLevelInsight',
    uiUsage:
      'Country names on globe tooltips, country insights section, header search, country links.',
    exampleNote:
      'Rows with Alpha-3 code, official name, region groups, lat/long, etc.',
  },
  {
    title: 'Facts (paginated)',
    apiUrl: `${API_BASE_URL}/Facts?…`,
    functionName: 'getFactsPage',
    chain:
      'HTTP GET per page → getFactsPage → useIncrementalHomepageFacts (merge, cache) → Homepage as data={facts} → HomepageEl getGlobeData → GlobeComponent → transformDataForGraph → ThreeDGlobe',
    uiUsage:
      'Numeric/availability data behind the globe markers; merged rows also support panels when a country is selected.',
    exampleNote:
      'Each row: countryCode, year, mainIndicatorId, subIndicatorId, numericValue, factId, etc.',
  },
];

function JsonBlock({
  label,
  value,
  maxHeight = 'min(420px, 50vh)',
}: {
  label: string;
  value: unknown;
  maxHeight?: string;
}) {
  const text = useMemo(() => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }, [value]);

  return (
    <div className='mb-8'>
      <ParagraphText weight='bold' className='mb-2'>
        {label}
      </ParagraphText>
      <pre
        className='overflow-auto rounded-md bg-[#0d1117] p-4 text-left text-xs text-[#e6edf3] border border-white/10'
        style={{ maxHeight }}
      >
        {text}
      </pre>
    </div>
  );
}

export function DataSourcesDebugPage() {
  /** Same query keys + transforms as `useGlobalData` in App.tsx (shared React Query cache). */
  const indicatorsQuery = useQuery({
    queryKey: ['indicatorsMetaData'],
    queryFn: getIndicatorsMetaData,
    select: (data: IndicatorsMetaDataType[]) =>
      data.map(c => ({
        ...c,
        subIndicators: c.subIndicators.map(d => ({
          ...d,
          id: `${d.mainIndicatorId}_${d.subIndicatorId}`,
        })),
      })),
  });
  const countriesQuery = useQuery({
    queryKey: ['countriesList'],
    queryFn: getCountriesList,
    select: (countries: CountriesFromApiDataType[]) =>
      countries
        .map(c => getCountryDetailsFromISO3(c.countryCode))
        .filter((c?: CountriesDataType) => c !== undefined),
  });

  const indicatorsMetaData = indicatorsQuery.data ?? [];
  const countriesListData = countriesQuery.data ?? [];
  const countriesListLoading = countriesQuery.isLoading;
  const countriesListError = countriesQuery.isError;

  const [directIndicators, setDirectIndicators] = useState<unknown>(null);
  const [directCountries, setDirectCountries] = useState<unknown>(null);
  const [directLoading, setDirectLoading] = useState(false);
  const [directError, setDirectError] = useState<string | null>(null);

  const firstSub = indicatorsMetaData[0]?.subIndicators?.[0];

  const factsSampleQuery = useQuery({
    queryKey: [
      'factsSample',
      firstSub?.mainIndicatorId,
      firstSub?.subIndicatorId,
    ],
    enabled: Boolean(firstSub),
    retry: false,
    queryFn: () =>
      getFactsPage({
        mainIndicatorId: firstSub!.mainIndicatorId,
        subIndicatorId: firstSub!.subIndicatorId,
        regionId: null,
        productMarketId: null,
        page: 1,
        pageSize: 5,
      }),
  });

  const factsSample = factsSampleQuery.data ?? null;
  const factsLoading = factsSampleQuery.isLoading;
  const factsSampleError = factsSampleQuery.isError
    ? factsSampleQuery.error instanceof Error
      ? factsSampleQuery.error.message
      : 'Request failed'
    : null;

  const loadDirectApis = () => {
    setDirectLoading(true);
    setDirectError(null);
    Promise.all([getIndicatorsMetaData(), getCountriesList()])
      .then(([ind, ctr]) => {
        setDirectIndicators(ind);
        setDirectCountries(ctr);
      })
      .catch(e => {
        setDirectError(e instanceof Error ? e.message : 'Request failed');
      })
      .finally(() => setDirectLoading(false));
  };

  const contextSnapshot = useMemo(
    () => ({
      note: 'This is what React Query already holds after the app loaded (same sources as homepage).',
      indicatorsMetaDataCount: indicatorsMetaData.length,
      indicatorsMetaDataFirstPillar: indicatorsMetaData[0] ?? null,
      countriesListCount: countriesListData.length,
      countriesListFirstThree: countriesListData.slice(0, 3),
      countriesListLoading,
      countriesListError,
    }),
    [
      indicatorsMetaData,
      countriesListData,
      countriesListLoading,
      countriesListError,
    ],
  );

  return (
    <div className='container mx-auto px-4 py-10 max-w-5xl'>
      <Link
        to='/'
        className='text-sm opacity-80 hover:opacity-100 underline mb-6 inline-block'
      >
        ← Back to homepage
      </Link>
      <HeadingText type='h1'>Data sources & API chain (debug)</HeadingText>
      <Spacer size='base' />
      <ParagraphText className='opacity-90'>
        Development reference: which HTTP endpoints feed the first screen, which
        functions wrap them, how data flows into components, and where it
        appears in the UI. Raw JSON below is for inspection only.
      </ParagraphText>
      <Spacer size='xl' />

      <HeadingText type='h2'>Chain: API → function → UI</HeadingText>
      <Spacer size='base' />
      <div className='overflow-x-auto rounded-lg border border-white/10'>
        <table className='w-full text-left text-sm border-collapse'>
          <thead>
            <tr className='bg-white/5 border-b border-white/10'>
              <th className='p-3 font-semibold'>Source</th>
              <th className='p-3 font-semibold'>API (URL)</th>
              <th className='p-3 font-semibold'>Function</th>
              <th className='p-3 font-semibold'>Chain to UI</th>
              <th className='p-3 font-semibold'>Where on screen</th>
            </tr>
          </thead>
          <tbody>
            {DATA_FLOW_ROWS.map(row => (
              <tr
                key={row.title}
                className='border-b border-white/10 align-top hover:bg-white/[0.03]'
              >
                <td className='p-3 font-medium'>{row.title}</td>
                <td className='p-3 font-mono text-xs break-all opacity-90'>
                  {row.apiUrl}
                </td>
                <td className='p-3 font-mono text-xs'>{row.functionName}</td>
                <td className='p-3 text-xs opacity-90'>{row.chain}</td>
                <td className='p-3 text-xs opacity-90'>{row.uiUsage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Spacer size='base' />
      <ParagraphText size='sm' className='opacity-70'>
        Example shapes: {DATA_FLOW_ROWS.map(r => r.exampleNote).join(' · ')}
      </ParagraphText>

      <Spacer size='3xl' />
      <HeadingText type='h2'>
        Live context snapshot (homepage global data)
      </HeadingText>
      <Spacer size='base' />
      <JsonBlock
        label='React Query snapshot (same keys as App: indicatorsMetaData, countriesList)'
        value={contextSnapshot}
      />

      <HeadingText type='h2'>
        Fresh API samples (same functions the app uses)
      </HeadingText>
      <Spacer size='base' />
      <ParagraphText size='sm' className='mb-4 opacity-80'>
        Facts sample: first page only (5 rows) for the first sub-indicator in
        metadata — full homepage load merges many pages in the background.
      </ParagraphText>
      <button
        type='button'
        onClick={loadDirectApis}
        disabled={directLoading}
        className='mb-6 rounded-md border border-white/20 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50'
      >
        {directLoading ? 'Loading…' : 'Fetch Indicators + Countries (direct)'}
      </button>
      {directError ? (
        <ParagraphText className='text-red-300 mb-4'>
          {directError}
        </ParagraphText>
      ) : null}
      {directIndicators !== null ? (
        <JsonBlock
          label='getIndicatorsMetaData() — raw (truncated display if huge)'
          value={
            Array.isArray(directIndicators) && directIndicators.length > 2
              ? {
                  _length: directIndicators.length,
                  firstTwo: directIndicators.slice(0, 2),
                  _note:
                    'Full array is large; open Network tab for complete response.',
                }
              : directIndicators
          }
        />
      ) : null}
      {directCountries !== null ? (
        <JsonBlock
          label='getCountriesList() — raw (truncated display if huge)'
          value={
            Array.isArray(directCountries) && directCountries.length > 3
              ? {
                  _length: directCountries.length,
                  firstThree: directCountries.slice(0, 3),
                  _note:
                    'Full array is large; open Network tab for complete response.',
                }
              : directCountries
          }
        />
      ) : null}

      <ParagraphText weight='bold' className='mb-2'>
        getFactsPage — sample (page 1, pageSize 5){' '}
        {firstSub
          ? `(mainIndicatorId=${firstSub.mainIndicatorId}, subIndicatorId=${firstSub.subIndicatorId})`
          : '(waiting for indicators metadata)'}
      </ParagraphText>
      {factsLoading ? (
        <ParagraphText className='opacity-70'>
          Loading facts sample…
        </ParagraphText>
      ) : null}
      {factsSampleError ? (
        <ParagraphText className='text-red-300'>
          {factsSampleError}
        </ParagraphText>
      ) : null}
      {factsSample !== null && !factsLoading ? (
        <JsonBlock label='getFactsPage response' value={factsSample} />
      ) : null}
    </div>
  );
}
