import { Spacer } from '@undp/design-system-react/Spacer';
import { Label } from '@undp/design-system-react/Label';
import { DropdownSelect } from '@undp/design-system-react/DropdownSelect';
import { DonutChart } from '@undp/data-viz/DonutChart';
import { SimpleLineChart } from '@undp/data-viz/SimpleLineChart';
import { transformDataForGraph } from '@undp/data-viz/transformData';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@undp/design-system-react/Badge';

import SubNationalVIz from './SubNationalVIz';

import { PrintButton } from '@/Components/PDFExport/PrintButton';
import { WebGLPrintPlaceholder } from '@/Components/PDFExport/WebGLPrintPlaceholder';
import { DROPDOWN_CLASSNAMES } from '@/Constants';
import { GraphCard } from '@/Components/GraphCard';
import { IndicatorsMetaDataType } from '@/Types';
import { NoData } from '@/Components/NoData';
import { HeadingText, ParagraphText } from '@/Components/Typography';
import { customDropdownComponents } from '@/Utils/DropdownComponents';
import { BarChartList } from '@/Components/BarChartList';
import { useIsMobileBreakpoint } from '@/Utils/useIsMobileBreakpoint';
import {
  CountryIndicatorDashboardResponse,
  ProductMarketRefDto,
} from '@/QueryFn/getCountryIndicatorDashboard';

interface RegionListDataType {
  regionId: number;
  name: string;
}

interface Props {
  dashboard: CountryIndicatorDashboardResponse;
  indicatorMetaData: IndicatorsMetaDataType;
  regionList: RegionListDataType[];
  countryCode: string;
  suffix: string;
}

const CONTRACT_VALUE = ['All', 'High', 'High + Medium'];

/** Map a sub-indicator code string (e.g. "corr_singleb") to composite id ("1_3"). */
function codeToCompositeId(
  code: string | null,
  indicatorMetaData: IndicatorsMetaDataType,
): string | undefined {
  if (!code) return undefined;
  return indicatorMetaData.subIndicators.find(s => s.code === code)?.id;
}

function Viz({
  dashboard,
  indicatorMetaData,
  regionList,
  countryCode,
  suffix,
}: Props) {
  const isMobile = useIsMobileBreakpoint();

  const availableYears = useMemo(
    () => [...(dashboard.availableYears ?? [])].sort((a, b) => b - a),
    [dashboard.availableYears],
  );
  const latestYear = dashboard.latestYear ?? availableYears[0] ?? 0;

  const availableMarkets: ProductMarketRefDto[] = dashboard.availableMarkets ?? [];

  const [selectedYear, setSelectedYear] = useState(latestYear);
  const [selectedSubIndicator, setSelectedSubIndicator] = useState({
    value: indicatorMetaData.subIndicators[0].id,
    label: indicatorMetaData.subIndicators[0].name,
  });
  const [selectedMarket, setSelectedMarket] = useState<
    ProductMarketRefDto | undefined
  >(undefined);
  const [selectedContractValue, setSelectedContractValue] = useState({
    value: 'ALL',
    label: 'All',
  });

  useEffect(() => {
    setSelectedYear(latestYear);
  }, [latestYear]);

  // Overview table row — map by sub-indicator composite id
  const latestOverviewById = useMemo(() => {
    const map: Record<string, NonNullable<typeof dashboard.latestOverview>[0]> = {};
    for (const row of dashboard.latestOverview ?? []) {
      const id = codeToCompositeId(row.subIndicatorId, indicatorMetaData);
      if (id) map[id] = row;
    }
    return map;
  }, [dashboard.latestOverview, indicatorMetaData]);

  // Market breakdown for the selected sub-indicator / year / contractValue
  const marketBreakdownRows = useMemo(() => {
    const selectedSubCode = indicatorMetaData.subIndicators.find(
      s => s.id === selectedSubIndicator.value,
    )?.code;

    const breakdown = (dashboard.marketBreakdown ?? []).find(
      mb =>
        mb.subIndicatorId === selectedSubCode &&
        mb.year === selectedYear &&
        mb.contractValue === selectedContractValue.value,
    );
    return breakdown?.markets ?? [];
  }, [
    dashboard.marketBreakdown,
    indicatorMetaData,
    selectedSubIndicator.value,
    selectedYear,
    selectedContractValue.value,
  ]);

  // Overview donut value — from latestOverview, filtered by market + contractValue
  const overviewDonutValue = useMemo(() => {
    if (selectedMarket) {
      // When a market is selected, look in marketBreakdown
      const marketRow = marketBreakdownRows.find(
        m => m.productMarketId === selectedMarket.productMarketId,
      );
      return marketRow?.numericValue ?? null;
    }
    // No market selected — use latestOverview
    return latestOverviewById[selectedSubIndicator.value]?.numericValue ?? null;
  }, [
    selectedMarket,
    marketBreakdownRows,
    latestOverviewById,
    selectedSubIndicator.value,
  ]);

  // Data availability series for selected sub-indicator / contractValue / market
  const availabilitySeries = useMemo(() => {
    const selectedSubCode = indicatorMetaData.subIndicators.find(
      s => s.id === selectedSubIndicator.value,
    )?.code;

    const entry = (dashboard.dataAvailability ?? []).find(
      a =>
        a.subIndicatorId === selectedSubCode &&
        a.contractValue === selectedContractValue.value &&
        (selectedMarket
          ? a.productMarket?.productMarketId === selectedMarket.productMarketId
          : a.productMarket == null),
    );

    return (entry?.series ?? []).map(s => ({
      Year: s.year,
      Indicator_availability:
        s.indicatorAvailability !== null ? s.indicatorAvailability * 100 : null,
    }));
  }, [
    dashboard.dataAvailability,
    indicatorMetaData,
    selectedSubIndicator.value,
    selectedContractValue.value,
    selectedMarket,
  ]);

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <HeadingText type='h3' alignment='center'>
          {latestYear}
        </HeadingText>
        <PrintButton />
      </div>
      <Spacer size='4xl' />
      {/* Overview table — latest year, all sub-indicators */}
      <div className='dark'>
        {!isMobile && (
          <div className='flex w-full pb-2 border-b border-b-primary-white'>
            <div className='poppins-semibold text-[16px]! text-primary-white! w-[40%] pr-4!'>
              Indicator name
            </div>
            <div className='poppins-semibold text-[16px]! text-primary-white! w-[20%] pr-4!'>
              Indicator value
            </div>
            <div className='poppins-semibold text-[16px]! text-primary-white! w-[20%] pr-4!'>
              Status
            </div>
            <div className='poppins-semibold text-[16px]! text-primary-white! w-[20%] pr-4!'>
              Bands
            </div>
          </div>
        )}
        <div>
          {indicatorMetaData.subIndicators.map((el, i) => {
            const rowData = latestOverviewById[el.id];
            return (
              <div key={i}>
                {isMobile ? (
                  <div className='py-4 border-b border-b-[0.5px] border-b-primary-white'>
                    <ParagraphText
                      size='sm'
                      weight='medium'
                      marginBottom='none'
                      className='text-primary-white mb-1'
                    >
                      {el.name} ({el.description})
                    </ParagraphText>
                    <div className='flex items-center gap-3 flex-wrap mt-2'>
                      <span className='poppins-light text-[13px] text-primary-white'>
                        {rowData?.numericValue ?? 'NA'}{' '}
                        {rowData?.numericValue != null ? suffix : ''}
                      </span>
                      <Badge
                        rounded='full'
                        className='poppins-medium py-0 text-[11px]! px-2!'
                        style={{ backgroundColor: '#DADADA', color: '#000' }}
                      >
                        {rowData?.indicatorValue || 'NA'}
                      </Badge>
                    </div>
                    {rowData?.bandData && (
                      <div className='mt-2 text-[12px] poppins-light text-primary-white opacity-70'>
                        Low: {rowData.bandData.low_Min}
                        {suffix} - {rowData.bandData.low_Max}
                        {suffix}
                        {' · '}Medium: {rowData.bandData.medium_Min}
                        {suffix} - {rowData.bandData.medium_Max}
                        {suffix}
                        {' · '}High: {rowData.bandData.high_Min}
                        {suffix} - {rowData.bandData.high_Max}
                        {suffix}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className='flex w-full py-4 border-b border-b-[0.5px] border-b-primary-white items-center'>
                    <div className='poppins-light text-[16px]! text-primary-white! w-[40%] pr-4!'>
                      {el.name} ({el.description})
                    </div>
                    <div className='poppins-light text-[16px]! text-primary-white! w-[20%] pr-4!'>
                      {rowData?.numericValue ?? 'NA'}{' '}
                      {rowData?.numericValue != null ? suffix : ''}
                    </div>
                    <div className='poppins-light text-[16px]! text-primary-white! w-[20%] pr-4!'>
                      <Badge
                        rounded='full'
                        className='poppins-medium py-0 text-[14px]! px-3!'
                        style={{ backgroundColor: '#DADADA', color: '#000' }}
                      >
                        {rowData?.indicatorValue || 'NA'}
                      </Badge>
                    </div>
                    <div className='poppins-light text-[16px]! text-primary-white! w-[20%] pr-4!'>
                      {rowData?.bandData && (
                        <>
                          <strong>Low:</strong> {rowData.bandData.low_Min}
                          {suffix || ''} - {rowData.bandData.low_Max}
                          {suffix || ''}
                          <br />
                          <strong>Medium:</strong>{' '}
                          {rowData.bandData.medium_Min}
                          {suffix || ''} - {rowData.bandData.medium_Max}
                          {suffix || ''}
                          <br />
                          <strong>High:</strong> {rowData.bandData.high_Min}
                          {suffix || ''} - {rowData.bandData.high_Max}
                          {suffix || ''}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <Spacer size='xl' />
        <ParagraphText size='sm' className='italic! opacity-50'>
          *Indicator values are categorized as High, Medium, Low, or Not
          Available based on each country's relative position in a given year.
          Countries in the top third of the distribution are classified as High,
          those in the middle third as Medium, and those in the bottom third as
          Low, while missing values are labeled Not Available. Consequently, the
          thresholds defining each category vary by year.
        </ParagraphText>
      </div>
      <Spacer size='8xl' />
      {/* Filter controls */}
      <div className='print-hide flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full'>
        <div className='flex flex-col gap-1 w-full lg:w-[calc(25%-0.75rem)] grow-1 lg:min-w-[240px]'>
          <Label className='text-primary-white'>Sub-pillar</Label>
          <DropdownSelect
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(d: any) => setSelectedSubIndicator(d)}
            value={selectedSubIndicator}
            options={indicatorMetaData.subIndicators.map(d => ({
              value: d.id,
              label: d.name,
            }))}
            size='base'
            variant='normal'
            className='poppins-regular border-0! rounded-[8px]!'
            classNames={DROPDOWN_CLASSNAMES}
            components={customDropdownComponents('light', false)}
          />
        </div>
        <div className='flex flex-col gap-1 w-full lg:w-[calc(25%-0.75rem)] grow-1 lg:min-w-[240px]'>
          <Label className='text-primary-white'>Year</Label>
          <DropdownSelect
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(d: any) => setSelectedYear(d.value)}
            value={{ value: selectedYear, label: selectedYear }}
            options={availableYears.map(d => ({ value: d, label: d }))}
            size='base'
            variant='normal'
            className='poppins-regular border-0! rounded-[8px]!'
            classNames={DROPDOWN_CLASSNAMES}
            components={customDropdownComponents('light', false)}
          />
        </div>
        <div className='flex flex-col gap-1 w-full lg:w-[calc(25%-0.75rem)] grow-1 lg:min-w-[240px]'>
          <Label className='text-primary-white'>Market</Label>
          <DropdownSelect
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(d: any) => {
              setSelectedMarket(
                d
                  ? { productMarketId: d.value, name: d.label }
                  : undefined,
              );
            }}
            value={
              selectedMarket
                ? {
                    value: selectedMarket.productMarketId,
                    label: selectedMarket.name,
                  }
                : undefined
            }
            placeholder='Select market'
            options={availableMarkets.map(m => ({
              value: m.productMarketId,
              label: m.name,
            }))}
            isClearable
            size='base'
            variant='normal'
            className='poppins-regular border-0! rounded-[8px]!'
            classNames={DROPDOWN_CLASSNAMES}
            components={customDropdownComponents('light', false)}
          />
        </div>
        <div className='flex flex-col gap-1 w-full lg:w-[calc(25%-0.75rem)] grow-1 lg:min-w-[240px]'>
          <Label className='text-primary-white'>Contract value</Label>
          <DropdownSelect
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(d: any) => setSelectedContractValue(d)}
            placeholder='Select contract value'
            value={selectedContractValue}
            options={CONTRACT_VALUE.map(d => ({
              value: d.toUpperCase(),
              label: d,
            }))}
            size='base'
            variant='normal'
            className='poppins-regular border-0! rounded-[8px]!'
            classNames={DROPDOWN_CLASSNAMES}
            components={customDropdownComponents('light', false)}
          />
        </div>
      </div>
      <Spacer size='2xl' />
      <div className='flex flex-col gap-6'>
        <div className='flex gap-6 flex-wrap'>
          {/* Overview donut */}
          <GraphCard
            title='Overview'
            chips={[selectedSubIndicator.label, selectedYear]}
          >
            {overviewDonutValue !== null ? (
              <>
                <ParagraphText size='sm'>
                  {
                    indicatorMetaData.subIndicators.find(
                      d => d.id === selectedSubIndicator.value,
                    )?.description
                  }
                </ParagraphText>
                <Spacer size='3xl' />
                <div className='flex grow relative'>
                  <DonutChart
                    data={[
                      { label: 'Value', size: overviewDonutValue },
                      {
                        label: 'Rest',
                        size:
                          (indicatorMetaData.maxValue ?? 100) -
                          overviewDonutValue,
                      },
                    ]}
                    strokeWidth={14}
                    showColorScale={false}
                    colors={[indicatorMetaData.mainColor || '#fff', '#fff']}
                    mainText={`${overviewDonutValue.toFixed(2)}${suffix}`}
                  />
                </div>
              </>
            ) : (
              <NoData />
            )}
          </GraphCard>

          {/* Market breakdown bar chart */}
          <GraphCard
            title='Market Breakdown'
            chips={[selectedSubIndicator.label, selectedYear]}
          >
            <div className='flex flex-col h-full gap-4'>
              {marketBreakdownRows.length > 0 ? (
                <BarChartList
                  data={marketBreakdownRows
                    .filter(m => m.numericValue !== null)
                    .map(m => ({
                      id: m.marketName ?? String(m.productMarketId),
                      value: m.numericValue as number,
                    }))}
                  color={indicatorMetaData.mainColor}
                  maxValue={indicatorMetaData.maxValue ?? 100}
                  suffix={indicatorMetaData.suffix || ''}
                />
              ) : (
                <div className='h-full flex items-center'>
                  <NoData />
                </div>
              )}
              <div />
            </div>
          </GraphCard>
        </div>

        {/* Regional breakdown — keeps old Facts-based SubNationalVIz */}
        <div className='flex gap-6 flex-wrap'>
          <GraphCard
            title='Regional Breakdown'
            chips={[selectedSubIndicator.label, selectedYear]}
            className='basis-full'
          >
            <WebGLPrintPlaceholder message='View interactive regional map on the website'>
              <SubNationalVIz
                mainIndicatorId={indicatorMetaData.mainIndicatorId}
                regionList={regionList}
                countryCode={countryCode}
                productMarketId={selectedMarket?.productMarketId || null}
                year={selectedYear}
                subIndicatorId={selectedSubIndicator.value}
                mainColor={indicatorMetaData.mainColor}
                colors={
                  indicatorMetaData.subIndicators.find(
                    d => d.id === selectedSubIndicator.value,
                  )?.colors || ''
                }
                contractValue={selectedContractValue.value}
                suffix={suffix}
                maxValue={indicatorMetaData.maxValue ?? 100}
              />
            </WebGLPrintPlaceholder>
          </GraphCard>
        </div>

        {/* Data availability over time — from DTO dataAvailability field */}
        <div className='flex gap-6 flex-wrap'>
          <GraphCard
            title='Data availability over time'
            chips={[selectedSubIndicator.label]}
          >
            <div className='flex h-[360px] dark w-full'>
              {availabilitySeries.filter(s => s.Indicator_availability !== null)
                .length > 0 ? (
                <SimpleLineChart
                  data={transformDataForGraph(
                    availabilitySeries,
                    'lineChart',
                    [
                      { chartConfigId: 'date', columnId: 'Year' },
                      {
                        chartConfigId: 'y',
                        columnId: 'Indicator_availability',
                      },
                    ],
                  )}
                  lineColor={indicatorMetaData.mainColor || '#fff'}
                  showDots
                  maxValue={indicatorMetaData.maxValue ?? 100}
                  animate
                  suffix={indicatorMetaData.suffix || ''}
                  classNames={{
                    xAxis: { labels: 'poppins-regular' },
                    yAxis: { labels: 'poppins-regular' },
                    tooltip:
                      'poppins-regular bg-[var(--color-text-black)] p-4 border-0',
                  }}
                  tooltip={d => (
                    <div className='flex flex-col bg-[var(--color-text-black)]'>
                      <ParagraphText size='sm' weight='bold'>
                        {d.data.Year}
                      </ParagraphText>
                      <div className='flex gap-8 justify-between pt-4'>
                        <ParagraphText size='sm'>Data availability</ParagraphText>
                        <ParagraphText size='sm'>
                          {d.data.Indicator_availability ?? 'NA'}
                        </ParagraphText>
                      </div>
                    </div>
                  )}
                />
              ) : (
                <div className='h-full flex items-center justify-center w-full'>
                  <NoData />
                </div>
              )}
            </div>
          </GraphCard>
        </div>
      </div>
    </div>
  );
}

export default Viz;
