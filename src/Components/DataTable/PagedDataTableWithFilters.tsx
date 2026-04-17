import { useMemo, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { DropdownSelect } from '@undp/design-system-react/DropdownSelect';
import { Label } from '@undp/design-system-react/Label';
import { Badge } from '@undp/design-system-react/Badge';
import { Link } from '@tanstack/react-router';
import { Spacer } from '@undp/design-system-react/Spacer';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@undp/design-system-react/HoverCard';
import { InfoIcon } from 'lucide-react';
import { Spinner } from '@undp/design-system-react/Spinner';
import { getTextColorBasedOnBgColor } from '@undp/data-viz/utils';

import { ParagraphText } from '@/Components/Typography';
import { Button } from '@/Components/Button';
import {
  DROPDOWN_CLASSNAMES,
  DROPDOWN_CLASSNAMES_MULTI_SELECT,
} from '@/Constants';
import { CountriesDataType, IndicatorsMetaDataType } from '@/Types';
import { customDropdownComponents } from '@/Utils/DropdownComponents';
import { getFactsTable, FactsTableRow } from '@/QueryFn/getFactsTable';
import type { FactsTableResponse } from '@/QueryFn/getFactsTable';
import { useIsMobileBreakpoint } from '@/Utils/useIsMobileBreakpoint';

import staticFactsTableDefault from '@/static/cache/factsTable_default.json';

interface Props {
  indicatorsMetaData: IndicatorsMetaDataType[];
  countriesList: CountriesDataType[];
}

const DEFAULT_PAGE_SIZE = 50;

function yearsList(): { value: number; label: number }[] {
  const start = 2006;
  const end = new Date().getFullYear();
  const years: { value: number; label: number }[] = [];
  for (let y = end; y >= start; y -= 1) years.push({ value: y, label: y });
  return years;
}

// Parse indicatorColors CSV into [low, medium, high] color array
function parseIndicatorColors(indicatorColors: string | null): string[] {
  if (!indicatorColors) return [];
  return indicatorColors.split(',').map(s => s.trim());
}

export function PagedDataTableWithFilters({
  indicatorsMetaData,
  countriesList,
}: Props) {
  const isMobile = useIsMobileBreakpoint();
  const subIndicators = indicatorsMetaData.map(d => d.subIndicators).flat();

  // Build a lookup: composite UI id (e.g. "1_2") -> API code (e.g. "corr_singleb")
  const compositeIdToCode = useMemo(() => {
    const m = new Map<string, string>();
    for (const sub of subIndicators) {
      const key = `${sub.mainIndicatorId}_${sub.subIndicatorId}`;
      if (sub.code) m.set(key, sub.code);
    }
    return m;
  }, [subIndicators]);

  const defaultSub = subIndicators[0];
  const [selectedPillars, setSelectedPillars] = useState<
    { value: string; label: string }[]
  >(
    defaultSub
      ? [
          {
            value: `${defaultSub.mainIndicatorId}_${defaultSub.subIndicatorId}`,
            label: defaultSub.name,
          },
        ]
      : [],
  );

  const [selectedYear, setSelectedYear] = useState(2022);
  const [page, setPage] = useState(1);
  const pageSize = DEFAULT_PAGE_SIZE;

  // Translate selected composite UI ids -> API sub-indicator codes
  const selectedApiCodes = useMemo(
    () =>
      selectedPillars
        .map(p => compositeIdToCode.get(p.value))
        .filter((c): c is string => Boolean(c)),
    [selectedPillars, compositeIdToCode],
  );

  // Use the pre-fetched static file as instant initialData for the default view
  const isDefaultState =
    selectedYear === 2022 &&
    selectedApiCodes.length === 1 &&
    selectedApiCodes[0] === 'corr_nonopenproc' &&
    page === 1 &&
    pageSize === DEFAULT_PAGE_SIZE;
  const staticInitialData = isDefaultState
    ? (staticFactsTableDefault as FactsTableResponse)
    : undefined;

  const query = useQuery({
    queryKey: ['factsTable', selectedYear, selectedApiCodes, page, pageSize],
    placeholderData: keepPreviousData,
    enabled: selectedApiCodes.length > 0,
    queryFn: () =>
      getFactsTable({
        year: selectedYear,
        subIndicatorIds: selectedApiCodes,
        page,
        pageSize,
      }),
    initialData: staticInitialData,
    initialDataUpdatedAt: staticInitialData ? 0 : undefined,
  });

  const rows: FactsTableRow[] = query.data?.rows ?? [];
  const hasNext = query.data?.hasNext ?? false;
  const isBusy = query.isFetching;

  return (
    <div className='gap-4.5 flex flex-col w-full text-primary-gray-700'>
      <div className='flex flex-col lg:flex-row justify-between w-full items-start lg:items-center gap-4'>
        <div className='gap-4 flex flex-col lg:flex-row grow-1 w-full lg:w-auto'>
          <div className='flex flex-col gap-1 w-full lg:w-[calc(25%-0.75rem)] grow-1 lg:min-w-[240px] lg:max-w-[480px] flex-wrap'>
            <Label className='text-primary-white'>Filter by year</Label>
            <DropdownSelect
              value={{ value: selectedYear, label: selectedYear }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(d: any) => {
                setSelectedYear(d.value);
                setPage(1);
              }}
              options={yearsList()}
              size='base'
              variant='normal'
              className='bg-primary-white! border-0! rounded-full! px-4!'
              classNames={DROPDOWN_CLASSNAMES}
              isClearable={false}
              components={customDropdownComponents('light', false)}
            />
          </div>
          <div className='flex flex-col gap-1 w-full lg:w-[calc(25%-0.75rem)] grow-1 lg:min-w-[240px] lg:max-w-[480px] flex-wrap'>
            <Label className='text-primary-white'>Filter by pillar</Label>
            <DropdownSelect
              placeholder='Select Pillar'
              value={selectedPillars}
              isMulti
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(d: any) => {
                setSelectedPillars(d);
                setPage(1);
              }}
              options={indicatorsMetaData.map(d => ({
                label: d.name,
                options: d.subIndicators.map(el => ({
                  value: `${el.mainIndicatorId}_${el.subIndicatorId}`,
                  label: el.name,
                })),
              }))}
              size='base'
              variant='normal'
              className='bg-primary-white! border-0! rounded-full! px-4!'
              classNames={DROPDOWN_CLASSNAMES_MULTI_SELECT}
              isClearable={false}
              components={customDropdownComponents('light', true)}
              maxTagCount={2}
            />
          </div>
        </div>
        <HoverCard openDelay={0}>
          <HoverCardTrigger>
            <div className='flex gap-2 items-center mt-6'>
              <ParagraphText
                weight='medium'
                marginBottom='none'
                className='p-0 leading-normal'
              >
                Data availability
              </ParagraphText>
              <InfoIcon color='#fff' size={16} />
            </div>
          </HoverCardTrigger>
          <HoverCardContent className='rounded text-[12px] poppins-regular !leading-[150%] p-3 rounded-[8px] text-[#4D4D4D] w-60'>
            Use the filters to see a list of countries with data for the chosen
            corruption-related indicator(s) and year. Public procurement
            indicators are available for the years 2017 to 2024. World Bank
            Enterprise Survey data is available for the years 2006 to 2025.
            Countries are listed in alphabetical order.
          </HoverCardContent>
        </HoverCard>
      </div>

      <Spacer size='lg' />

      <div className='dark'>
        {!isMobile && (
          <div className='flex items-center justify-between'>
            <div className='flex w-full pb-2 border-b border-b-primary-white'>
              <div className='poppins-semibold text-[16px]! text-primary-white! w-[35%] pr-4!'>
                Country name
              </div>
              <div className='poppins-semibold text-[16px]! text-primary-white! w-[25%] pr-4!'>
                Pillar
              </div>
              <div className='poppins-semibold text-[16px]! text-primary-white! w-[20%] pr-4!'>
                Indicator value
              </div>
              <div className='poppins-semibold text-[16px]! text-primary-white! w-[10%] pr-4!'>
                Value
              </div>
              <div className='poppins-semibold text-[16px]! text-primary-white! w-[10%] pr-4!' />
            </div>
          </div>
        )}

        {query.isLoading && <Spinner size='lg' className='my-10 m-auto' />}

        <div className={`mt-2 transition-opacity duration-200 ${isBusy && !query.isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {rows.map((el, i) => {
            // Use server-provided fields with local metadata as fallback
            const countryName =
              el.countryName ||
              countriesList.find(c => c['Alpha-3 code'] === el.countryCode)?.[
                'Country or Area (official name)'
              ] ||
              el.countryCode ||
              '';
            const pillarName = el.subIndicatorName || '';
            const suffix = el.suffix || '';
            const valueStr =
              el.numericValue === null || el.numericValue === undefined
                ? 'NA'
                : el.numericValue.toFixed(2) + suffix;

            // indicatorColors is a CSS-color CSV: "low_color, medium_color, high_color"
            const tagColors = parseIndicatorColors(el.indicatorColors);
            const bandIndex = ['LOW', 'MEDIUM', 'HIGH'].indexOf(
              el.indicatorValue ?? '',
            );
            const badgeBg =
              el.indicatorValue && bandIndex !== -1 && tagColors[bandIndex]
                ? tagColors[bandIndex]
                : '#DADADA';
            const badgeColor =
              el.indicatorValue && bandIndex !== -1 && tagColors[bandIndex]
                ? getTextColorBasedOnBgColor(tagColors[bandIndex])
                : '#000';

            return (
              <div key={`${el.factId}-${i}`}>
                {isMobile ? (
                  <div className='py-4 border-b border-b-[0.5px] border-b-primary-white'>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='poppins-medium text-[14px] text-primary-white'>
                        {countryName}
                      </span>
                      <Link
                        to='/countries/$isoCode/{-$indicator}'
                        className='poppins-medium text-[13px] text-primary-white opacity-100 hover:opacity-80 underline underline-offset-4 shrink-0 ml-2'
                        params={{ isoCode: el.countryCode ?? '' }}
                      >
                        View Details
                      </Link>
                    </div>
                    <div className='flex items-center gap-3 flex-wrap'>
                      <span className='poppins-light text-[13px] text-primary-white'>
                        {pillarName}
                      </span>
                      <Badge
                        rounded='full'
                        className='poppins-medium py-0 text-[11px]! px-2!'
                        style={{
                          backgroundColor: badgeBg,
                          color: badgeColor,
                        }}
                      >
                        {el.indicatorValue}
                      </Badge>
                      <span className='poppins-light text-[13px] text-primary-white'>
                        {valueStr}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className='flex w-full py-4 border-b border-b-[0.5px] border-b-primary-white items-center'>
                    <div className='poppins-light text-[16px]! text-primary-white! w-[35%] pr-4!'>
                      {countryName}
                    </div>
                    <div className='poppins-light text-[16px]! text-primary-white! w-[25%] pr-4!'>
                      {pillarName}
                    </div>
                    <div className='poppins-light text-[16px]! text-primary-white! w-[20%] pr-4!'>
                      <Badge
                        rounded='full'
                        className='poppins-medium py-0 text-[12px]! px-3!'
                        style={{
                          backgroundColor: badgeBg,
                          color: badgeColor,
                        }}
                      >
                        {el.indicatorValue}
                      </Badge>
                    </div>
                    <div className='poppins-light text-[16px]! text-primary-white! w-[10%] pr-4!'>
                      {valueStr}
                    </div>
                    <Link
                      to='/countries/$isoCode/{-$indicator}'
                      className='poppins-light text-[16px]! text-primary-white! w-[10%] pr-4! opacity-100 hover:opacity-80 underline underline-offset-4'
                      params={{ isoCode: el.countryCode ?? '' }}
                    >
                      View Details
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Spacer size='4xl' />

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <ParagraphText className='text-primary-white'>
              Page {page}
            </ParagraphText>
            {isBusy && <Spinner size='sm' className='text-[#61D4F8]' />}
          </div>
          <div className='flex gap-3'>
            <Button
              variant='secondary'
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isBusy}
            >
              Prev
            </Button>
            <Button
              variant='secondary'
              onClick={() => setPage(p => p + 1)}
              disabled={!hasNext || isBusy}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
