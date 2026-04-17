import { Spacer } from '@undp/design-system-react/Spacer';
import { Label } from '@undp/design-system-react/Label';
import { DropdownSelect } from '@undp/design-system-react/DropdownSelect';
import { DonutChart } from '@undp/data-viz/DonutChart';
import { SimpleLineChart } from '@undp/data-viz/SimpleLineChart';
import { transformDataForGraph } from '@undp/data-viz/transformData';
import { useMemo } from 'react';

import { DROPDOWN_CLASSNAMES } from '@/Constants';
import { GraphCard } from '@/Components/GraphCard';
import { IndicatorsMetaDataType } from '@/Types';
import { NoData } from '@/Components/NoData';
import { ParagraphText } from '@/Components/Typography';
import { customDropdownComponents } from '@/Utils/DropdownComponents';
import { PolarBarChart } from '@/Components/PolarBarChart';
import { PrintButton } from '@/Components/PDFExport/PrintButton';
import { useIsMobileBreakpoint } from '@/Utils/useIsMobileBreakpoint';
import {
  CountryIndicatorDashboardResponse,
  LatestOverviewEntry,
} from '@/QueryFn/getCountryIndicatorDashboard';

interface Props {
  dashboard: CountryIndicatorDashboardResponse;
  indicatorMetaData: IndicatorsMetaDataType;
  suffix: string;
}

/** Map a sub-indicator code string (e.g. "CORR1") to the composite id ("2_5") used by components. */
function codeToCompositeId(
  code: string | null,
  indicatorMetaData: IndicatorsMetaDataType,
): string | undefined {
  if (!code) return undefined;
  return indicatorMetaData.subIndicators.find(s => s.code === code)?.id;
}

/**
 * Convert a LatestOverviewEntry to the minimal shape PolarBarChart and
 * other viz components expect (id + numericValue + year).
 */
function overviewEntryToDataRow(
  entry: LatestOverviewEntry,
  indicatorMetaData: IndicatorsMetaDataType,
  year: number,
) {
  const id = codeToCompositeId(entry.subIndicatorId, indicatorMetaData);
  if (!id) return null;
  return {
    id,
    numericValue: entry.numericValue,
    indicatorValue: entry.indicatorValue,
    bandData: entry.bandData,
    year,
    // Fields required by DataType shape but not used by these charts
    countryCode: null,
    regionId: null,
    mainIndicatorId: indicatorMetaData.mainIndicatorId,
    subIndicatorId: 0,
    productMarketId: null,
    contractValue: 'ALL',
    factId: 0,
    totalNumberOfRiskyContracts: 0,
    allContracts: null,
    totalContractValueMillionUsd: 0,
    indicatorAvailabilityFilter: '',
  };
}

function Viz({ dashboard, indicatorMetaData, suffix }: Props) {
  const isMobile = useIsMobileBreakpoint();
  const mobileChipLabel = (label: string) =>
    label.length > 24 ? `${label.slice(0, 24)}...` : label;
  const latestYear = dashboard.latestYear ?? 0;
  const availableYears = useMemo(
    () => [...(dashboard.availableYears ?? [])].sort((a, b) => b - a),
    [dashboard.availableYears],
  );

  const firstSubIndicator = indicatorMetaData.subIndicators[0];

  // Convert latestOverview entries to the row shape expected by PolarBarChart
  const polarBarData = useMemo(() => {
    return (dashboard.latestOverview ?? [])
      .map(entry =>
        overviewEntryToDataRow(entry, indicatorMetaData, latestYear),
      )
      .filter((r): r is NonNullable<typeof r> => r !== null);
  }, [dashboard.latestOverview, indicatorMetaData, latestYear]);

  // Build data availability series for each sub-indicator (replaces trend-over-time)
  const availabilitySeriesMap = useMemo(() => {
    const map: Record<string, { year: number; value: number | null }[]> = {};
    for (const avail of dashboard.dataAvailability ?? []) {
      const id = codeToCompositeId(avail.subIndicatorId, indicatorMetaData);
      if (!id || avail.productMarket != null || avail.contractValue !== 'ALL')
        continue;
      map[id] = (avail.series ?? []).map(s => ({
        year: s.year,
        value:
          s.indicatorAvailability !== null
            ? s.indicatorAvailability * 100
            : null,
      }));
    }
    return map;
  }, [dashboard.dataAvailability, indicatorMetaData]);

  return (
    <div className='w-full'>
      <div className='flex justify-end mb-4'>
        <PrintButton />
      </div>
      <PolarBarChart
        innerRadiusRatio={0.6}
        indicatorMetaData={indicatorMetaData}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data={polarBarData as any}
        maxValue={indicatorMetaData.maxValue ?? 100}
        year={latestYear}
      />
      <Spacer size='8xl' />
      <div className='print-hide flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full'>
        <div className='flex flex-col gap-1 w-full lg:w-[calc(25%-0.75rem)] grow-1 lg:min-w-[240px]'>
          <Label className='text-primary-white'>Sub-pillar</Label>
          <DropdownSelect
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(_d: any) => {
              // year selector locked to latestYear — no-op
            }}
            defaultValue={{
              value: firstSubIndicator.id,
              label: firstSubIndicator.name,
            }}
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
            onChange={(_d: any) => {
              // Only latestYear available from new API
            }}
            value={{ value: latestYear, label: latestYear }}
            options={availableYears.map(d => ({
              value: d,
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
          {indicatorMetaData.subIndicators.map(sub => {
            const overviewEntry = (dashboard.latestOverview ?? []).find(
              e =>
                codeToCompositeId(e.subIndicatorId, indicatorMetaData) ===
                sub.id,
            );
            const hasValue =
              overviewEntry?.numericValue !== null &&
              overviewEntry?.numericValue !== undefined;

            return (
              <GraphCard
                key={sub.id}
                title='Overview'
                chips={[
                  isMobile ? mobileChipLabel(sub.name) : sub.name,
                  latestYear,
                ]}
              >
                {hasValue ? (
                  <>
                    <ParagraphText size='sm'>{sub.description}</ParagraphText>
                    <Spacer size='3xl' />
                    <div className='flex grow relative'>
                      <DonutChart
                        data={[
                          {
                            label: 'Value',
                            size: overviewEntry!.numericValue!,
                          },
                          {
                            label: 'Rest',
                            size:
                              (indicatorMetaData.maxValue ?? 100) -
                              overviewEntry!.numericValue!,
                          },
                        ]}
                        strokeWidth={14}
                        showColorScale={false}
                        colors={[indicatorMetaData.mainColor || '#fff', '#fff']}
                        mainText={`${overviewEntry!.numericValue!.toFixed(2)}${suffix}`}
                      />
                    </div>
                  </>
                ) : (
                  <NoData />
                )}
              </GraphCard>
            );
          })}

          {/* Data availability over time — replaces old trend-over-time chart */}
          {indicatorMetaData.subIndicators.map(sub => {
            const series = availabilitySeriesMap[sub.id] ?? [];
            const hasData = series.some(s => s.value !== null);
            return (
              <GraphCard
                key={`avail-${sub.id}`}
                title='Data availability over time'
                chips={[isMobile ? mobileChipLabel(sub.name) : sub.name]}
              >
                <div
                  className={`flex dark ${isMobile ? 'h-[260px]' : 'h-[360px]'}`}
                >
                  {hasData ? (
                    <SimpleLineChart
                      data={transformDataForGraph(series, 'lineChart', [
                        { chartConfigId: 'date', columnId: 'year' },
                        { chartConfigId: 'y', columnId: 'value' },
                      ])}
                      lineColor={indicatorMetaData.mainColor || '#fff'}
                      showDots={!isMobile}
                      animate={!isMobile}
                      suffix='%'
                      classNames={{
                        xAxis: { labels: 'poppins-regular' },
                        yAxis: { labels: 'poppins-regular' },
                        tooltip:
                          'poppins-regular bg-[var(--color-text-black)] p-4 border-0',
                      }}
                      tooltip={d => (
                        <div className='flex flex-col bg-[var(--color-text-black)]'>
                          <ParagraphText size='sm' weight='bold'>
                            {d.data.year}
                          </ParagraphText>
                          <div className='flex gap-8 justify-between pt-4'>
                            <ParagraphText size='sm'>
                              Data availability
                            </ParagraphText>
                            <ParagraphText size='sm'>
                              {d.data.value !== null &&
                              d.data.value !== undefined
                                ? `${(d.data.value as number).toFixed(1)}%`
                                : 'NA'}
                            </ParagraphText>
                          </div>
                        </div>
                      )}
                    />
                  ) : (
                    <NoData />
                  )}
                </div>
              </GraphCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Viz;
