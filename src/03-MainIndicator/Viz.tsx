import { Spacer } from '@undp/design-system-react/Spacer';
import { Label } from '@undp/design-system-react/Label';
import * as THREE from 'three';
import { DropdownSelect } from '@undp/design-system-react/DropdownSelect';
import { useEffect, useMemo, useState } from 'react';
import { ThreeDGlobe } from '@undp/data-viz/ThreeDGlobe';
import { transformDataForGraph } from '@undp/data-viz/transformData';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@undp/design-system-react/Spinner';

import { MethodologySection } from './Components/MethodologySection';

import { CountriesDataType, IndicatorsMetaDataType } from '@/Types';
import { DROPDOWN_CLASSNAMES } from '@/Constants';
import { customDropdownComponents } from '@/Utils/DropdownComponents';
import { ParagraphText } from '@/Components/Typography';
import { GraphCard } from '@/Components/GraphCard';
import { PrintButton } from '@/Components/PDFExport/PrintButton';
import { WebGLPrintPlaceholder } from '@/Components/PDFExport/WebGLPrintPlaceholder';
import { NoData } from '@/Components/NoData';
import DataTableSimple from '@/Components/DataTable/SecondaryTable';
import EnterpriseSurveyMethodology from '@/Components/MethodologyBlocks/EnterpriseSurveyMethodology';
import PublicProcurementMethodology from '@/Components/MethodologyBlocks/PublicProcurementMethodology';
import { useIsMobileBreakpoint } from '@/Utils/useIsMobileBreakpoint';
import {
  getIndicatorSummary,
  IndicatorSummaryDto,
  IndicatorSummaryTableRowDto,
} from '@/QueryFn/getIndicatorSummary';
import staticSummary1 from '@/static/cache/indicatorSummary_1.json';
import staticSummary2 from '@/static/cache/indicatorSummary_2.json';

const summaryCache: Record<number, IndicatorSummaryDto | undefined> = {
  1:
    Object.keys(staticSummary1).length > 0
      ? (staticSummary1 as unknown as IndicatorSummaryDto)
      : undefined,
  2:
    Object.keys(staticSummary2).length > 0
      ? (staticSummary2 as unknown as IndicatorSummaryDto)
      : undefined,
};

interface Props {
  indicatorMetaData: IndicatorsMetaDataType;
  countriesList: CountriesDataType[];
}

/** Shape DataTableSimple expects — only fields it actually reads */
function toTableRow(row: IndicatorSummaryTableRowDto): {
  countryCode: string;
  numericValue: number | null;
  indicatorValue: string | null;
} {
  return {
    countryCode: row.countryCode ?? '',
    numericValue: row.numericValue,
    indicatorValue: row.indicatorValue,
  };
}

function Viz({ indicatorMetaData, countriesList }: Props) {
  const isMobile = useIsMobileBreakpoint();

  const mainIndicatorId = indicatorMetaData.mainIndicatorId;
  const firstSubIndicator = indicatorMetaData.subIndicators[0];

  const [selectedSubIndicator, setSelectedSubIndicator] = useState({
    value: firstSubIndicator.id,
    label: firstSubIndicator.name,
    code: firstSubIndicator.code,
  });
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    undefined,
  );

  // The API sub-indicator param is the code string, not the composite id
  const selectedSubIndicatorCode = selectedSubIndicator.code;

  const seededInitial = summaryCache[mainIndicatorId];

  const { data: summary, isLoading } = useQuery({
    queryKey: [
      'indicatorSummary',
      mainIndicatorId,
      selectedYear,
      selectedSubIndicatorCode,
    ],
    queryFn: () =>
      getIndicatorSummary(mainIndicatorId, {
        year: selectedYear,
        subIndicatorId: selectedSubIndicatorCode,
      }),
    initialData: seededInitial,
    initialDataUpdatedAt: 0,
  });

  const availableYears = useMemo(
    () => [...(summary?.availableYears ?? [])].sort((a, b) => b - a),
    [summary?.availableYears],
  );
  const latestYear = summary?.latestYear ?? availableYears[0];

  // Initialise selectedYear once we know the latest year
  useEffect(() => {
    if (latestYear && !selectedYear) setSelectedYear(latestYear);
  }, [latestYear, selectedYear]);

  // Reset sub-indicator when indicator changes (e.g. navigating between pillars)
  useEffect(() => {
    setSelectedSubIndicator({
      value: firstSubIndicator.id,
      label: firstSubIndicator.name,
      code: firstSubIndicator.code,
    });
    setSelectedYear(undefined);
  }, [firstSubIndicator]);

  const globeData = useMemo(() => {
    if (!summary?.currentGlobeRows) return [];
    return transformDataForGraph(summary.currentGlobeRows, 'threeDGlobe', [
      { chartConfigId: 'id', columnId: 'countryCode' },
      { chartConfigId: 'x', columnId: 'numericValue' },
    ]);
  }, [summary?.currentGlobeRows]);

  const tableData = useMemo(() => {
    return (summary?.tableRows ?? []).map(toTableRow);
  }, [summary?.tableRows]);

  const overviewStats = summary?.overviewStats;
  const activeYear = selectedYear ?? latestYear;

  const subIndicatorColors = indicatorMetaData.subIndicators
    .find(el => el.id === selectedSubIndicator.value)
    ?.colors.split(',');
  const globeScale =
    isMobile && typeof window !== 'undefined'
      ? Math.max(0.95, Math.min(1.15, window.innerWidth / 360))
      : 1.65;

  return (
    <div className='container mx-auto px-4 lg:px-0'>
      <div className='print-hide flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full'>
        <div className='flex flex-col gap-1 w-full lg:w-[calc(25%-0.75rem)] grow-1 lg:min-w-[240px]'>
          <Label className='text-primary-white'>Sub-pillar</Label>
          <DropdownSelect
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(d: any) => {
              setSelectedSubIndicator({
                value: d.value,
                label: d.label,
                code:
                  indicatorMetaData.subIndicators.find(s => s.id === d.value)
                    ?.code ?? '',
              });
            }}
            value={selectedSubIndicator}
            options={indicatorMetaData.subIndicators.map(d => ({
              value: d.id,
              label: d.name,
            }))}
            size='base'
            variant='normal'
            className='poppins-regular border-0! rounded-[100px]! px-2!'
            classNames={DROPDOWN_CLASSNAMES}
            components={customDropdownComponents('light', false)}
          />
        </div>
        <div className='flex flex-col gap-1 w-full lg:w-[calc(25%-0.75rem)] grow-1 lg:min-w-[240px]'>
          <Label className='text-primary-white'>Year</Label>
          <DropdownSelect
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(d: any) => setSelectedYear(d.value)}
            defaultValue={
              latestYear ? { value: latestYear, label: latestYear } : undefined
            }
            value={
              activeYear ? { value: activeYear, label: activeYear } : undefined
            }
            options={availableYears.map(d => ({ value: d, label: d }))}
            size='base'
            variant='normal'
            className='poppins-regular border-0! rounded-[100px]! px-2!'
            classNames={DROPDOWN_CLASSNAMES}
            components={customDropdownComponents('light', false)}
          />
        </div>
      </div>
      <Spacer size='2xl' />
      {isLoading && !summary ? (
        <Spinner size='lg' className='my-20 m-auto' />
      ) : (
        <div className='flex flex-col gap-6'>
          <div className='flex gap-6 flex-wrap'>
            {/* Overview stats card — pre-computed by API, no quantile needed */}
            <GraphCard
              title='Overview'
              chips={[selectedSubIndicator.label, activeYear]}
            >
              {overviewStats && overviewStats.countryCount > 0 ? (
                <>
                  <ParagraphText size='sm'>
                    {
                      indicatorMetaData.subIndicators.find(
                        el => el.id === selectedSubIndicator.value,
                      )?.description
                    }
                  </ParagraphText>
                  <Spacer size='6xl' />
                  <ParagraphText
                    weight='light'
                    leading='none'
                    className='text-[56px]'
                  >
                    {overviewStats.countryCount}
                  </ParagraphText>
                  <Spacer size='xl' />
                  <ParagraphText leading='none'>
                    countries with {selectedSubIndicator.label.toLowerCase()}{' '}
                    data
                  </ParagraphText>
                  <Spacer size='6xl' />
                  <ParagraphText
                    weight='light'
                    leading='none'
                    className='text-[56px]'
                  >
                    {overviewStats.p25 !== null &&
                    overviewStats.p25 !== undefined
                      ? `${overviewStats.p25.toFixed(2)}${indicatorMetaData.suffix || ''}`
                      : 'NA'}
                  </ParagraphText>
                  <Spacer size='xl' />
                  <ParagraphText leading='none'>25 percentile</ParagraphText>
                  <Spacer size='6xl' />
                  <ParagraphText
                    weight='light'
                    leading='none'
                    className='text-[56px]'
                  >
                    {overviewStats.median !== null &&
                    overviewStats.median !== undefined
                      ? `${overviewStats.median.toFixed(2)}${indicatorMetaData.suffix || ''}`
                      : 'NA'}
                  </ParagraphText>
                  <Spacer size='xl' />
                  <ParagraphText leading='none'>Median</ParagraphText>
                  <Spacer size='6xl' />
                  <ParagraphText
                    weight='light'
                    leading='none'
                    className='text-[56px]'
                  >
                    {overviewStats.p75 !== null &&
                    overviewStats.p75 !== undefined
                      ? `${overviewStats.p75.toFixed(2)}${indicatorMetaData.suffix || ''}`
                      : 'NA'}
                  </ParagraphText>
                  <Spacer size='xl' />
                  <ParagraphText leading='none'>75 percentile</ParagraphText>
                  <Spacer size='6xl' />
                </>
              ) : (
                <NoData />
              )}
            </GraphCard>

            {/* Globe card */}
            <GraphCard
              title='Global Overview'
              chips={[selectedSubIndicator.label, activeYear]}
            >
              {globeData.length > 0 ? (
                <>
                  <WebGLPrintPlaceholder message='View interactive globe on the website'>
                    <div
                      className={`flex flex-col gap-4 grow min-h-[260px] ${
                        isMobile ? 'overflow-hidden' : 'radialGradientMask'
                      }`}
                    >
                      <ThreeDGlobe
                        showColorScale={false}
                        polygonAltitude={0.005}
                        highlightedAltitude={0.01}
                        colors={subIndicatorColors}
                        colorDomain={['LOW', 'MEDIUM', 'HIGH']}
                        scale={globeScale}
                        footNote=''
                        enableZoom={false}
                        atmosphereColor={
                          indicatorMetaData.subIndicators.find(
                            el => el.id === selectedSubIndicator.value,
                          )?.color
                        }
                        globeMaterial={
                          new THREE.MeshBasicMaterial({ color: 0xfafafa })
                        }
                        fogSettings={{
                          color:
                            indicatorMetaData.subIndicators.find(
                              el => el.id === selectedSubIndicator.value,
                            )?.color || '',
                          near: 300,
                          far: 450,
                        }}
                        atmosphereAltitude={0.1}
                        globeCurvatureResolution={2}
                        resetSelectionOnDoubleClick={false}
                        autoRotate={1}
                        data={globeData}
                      />
                    </div>
                  </WebGLPrintPlaceholder>
                  <ParagraphText size='xs' className='opacity-50 poppins-light'>
                    The designations employed and the presentation of material
                    on this map do not imply the expression of any opinion
                    whatsoever on the part of the Secretariat of the United
                    Nations or UNDP concerning the legal status of any country,
                    territory, city or area or its authorities, or concerning
                    the delimitation of its frontiers or boundaries.
                  </ParagraphText>
                </>
              ) : (
                <NoData />
              )}
            </GraphCard>
          </div>

          {/* Country-level table */}
          <div className='flex gap-6 flex-wrap'>
            <GraphCard
              title='Country-Level Overview'
              chips={[selectedSubIndicator.label, activeYear]}
              className='basis-full'
            >
              <Spacer size='xl' />
              <div className='flex dark'>
                {tableData.length > 0 ? (
                  <DataTableSimple
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data={tableData as any}
                    colors={subIndicatorColors ?? []}
                    countriesList={countriesList}
                    suffix={indicatorMetaData.suffix || ''}
                  />
                ) : (
                  <NoData />
                )}
              </div>
            </GraphCard>
          </div>
          <PrintButton />
        </div>
      )}
      {indicatorMetaData.mainIndicatorId === 1 ||
      indicatorMetaData.mainIndicatorId === 2 ? (
        <>
          <Spacer size='6xl' />
          <MethodologySection
            description={
              indicatorMetaData.mainIndicatorId === 1 ? (
                <PublicProcurementMethodology />
              ) : (
                <EnterpriseSurveyMethodology />
              )
            }
          />
        </>
      ) : null}
    </div>
  );
}

export default Viz;
