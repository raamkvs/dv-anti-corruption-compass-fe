import { motion, useInView, useScroll, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Spacer } from '@undp/design-system-react/Spacer';
import { Spinner } from '@undp/design-system-react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Link } from '@tanstack/react-router';
import * as THREE from 'three';
import { ThreeDGlobe } from '@undp/data-viz/ThreeDGlobe';
import { transformDataForGraph } from '@undp/data-viz/transformData';
import { getCountryDetailsFromISO3 } from '@undp-data/data-utils';
import { useQuery } from '@tanstack/react-query';

import GlobeControls from './Components/GlobeControls';
import Navigation from './Components/Navigation';
import GlobeComponent from './Components/GlobeComponent';
import CountryLevelInsight from './Sections/CountryLevelInsight';
import Introduction from './Sections/Introduction';
import { getHomepageDefaultSubIndicatorId } from './homepagePreferredSubIndicators';

import staticDashboard1 from '@/static/cache/countryDashboard_1.json';
import staticDashboard2 from '@/static/cache/countryDashboard_2.json';
import { mapGlobeSubIndicatorCodeToCompositeId } from '@/Utils/mapGlobeSubIndicatorCodeToCompositeId';
import type { CountryIndicatorDashboardResponse } from '@/QueryFn/getCountryIndicatorDashboard';
import { getCountryIndicatorDashboard } from '@/QueryFn/getCountryIndicatorDashboard';
import { CountriesDataType, IndicatorsMetaDataType } from '@/Types';
import { HeadingText, ParagraphText } from '@/Components/Typography';
import { ErrorState } from '@/Components/ErrorState';
import { ArcChart } from '@/Components/ArcChart';
import { BarChartList } from '@/Components/BarChartList';
import { Button } from '@/Components/Button';
import {
  logTimelinePhase,
  endTimeline,
  logResourceSummary,
} from '@/logging/loadTimeLogger';
import {
  HomepageCountriesYes,
  HomepageGlobeAvailability,
} from '@/Utils/homepageFactsCache';
import { useIsMobileBreakpoint } from '@/Utils/useIsMobileBreakpoint';

const isDev =
  typeof import.meta !== 'undefined' &&
  (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true;

interface MobileGlobeItemProps {
  index: number;
  indicator: IndicatorsMetaDataType;
  subIndicator: IndicatorsMetaDataType['subIndicators'][number] | undefined;
  subIndicatorId: string;
  filteredData: { countryCode: string; x: string; year: number }[];
  globeAvailabilityLoading: boolean;
  globeControlsRef: { current: (HTMLDivElement | null)[] };
  setInViewSlide: (i: number) => void;
  setSelectedSubIndicators: (updater: (prev: string[]) => string[]) => void;
  selectedId?: string;
  setSelectedId: (id?: string) => void;
}

function MobileGlobeItem({
  index,
  indicator,
  subIndicator,
  subIndicatorId,
  filteredData,
  globeAvailabilityLoading,
  globeControlsRef,
  setInViewSlide,
  setSelectedSubIndicators,
  selectedId,
  setSelectedId,
}: MobileGlobeItemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Delay mounting expensive WebGL globes for items 2+ until they scroll into view,
  // avoiding mobile browser WebGL context limit failures.
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });
  const shouldMount = index === 0 || isInView;
  const mobileScale =
    typeof window === 'undefined'
      ? 1.08
      : Math.max(0.95, Math.min(1.15, window.innerWidth / 360));

  return (
    <div
      ref={el => {
        globeControlsRef.current[index] = el;
      }}
      className='mb-8'
    >
      <GlobeControls
        onViewChange={el => {
          setInViewSlide(el);
        }}
        heading={indicator.name}
        description={indicator.description}
        buttons={indicator.subIndicators.map(el => ({
          label: el.name,
          value: `${el.mainIndicatorId}_${el.subIndicatorId}`,
          color: el.color,
        }))}
        onClick={el => {
          setSelectedSubIndicators(prev =>
            prev.map((v, idx) => (idx === index ? el : v)),
          );
        }}
        index={index}
      />
      <div
        ref={containerRef}
        className='w-full h-[min(72vw,360px)] min-h-[260px] overflow-hidden'
      >
        {globeAvailabilityLoading ? (
          <div className='flex flex-col items-center justify-center w-full h-full gap-3 opacity-60'>
            <Spinner size='sm' />
            <ParagraphText size='sm'>
              Loading {indicator.name} data...
            </ParagraphText>
          </div>
        ) : shouldMount ? (
          <ThreeDGlobe
            showColorScale={false}
            polygonAltitude={0.005}
            highlightedAltitude={0.01}
            colors={[subIndicator?.colors?.split(',')[0] || '#4A7591']}
            colorDomain={['Yes']}
            scale={mobileScale}
            footNote=''
            enableZoom={false}
            atmosphereColor={subIndicator?.color || '#117df8'}
            globeMaterial={new THREE.MeshBasicMaterial({ color: 0xfafafa })}
            atmosphereAltitude={0.15}
            globeCurvatureResolution={2}
            resetSelectionOnDoubleClick={false}
            autoRotate={1}
            selectedId={selectedId}
            onSeriesMouseClick={d => {
              setSelectedId(d?.id);
            }}
            data={transformDataForGraph(filteredData, 'threeDGlobe', [
              { chartConfigId: 'id', columnId: 'countryCode' },
              { chartConfigId: 'x', columnId: 'x' },
            ])}
          />
        ) : (
          <div className='flex flex-col items-center justify-center w-full h-full gap-3 opacity-40'>
            <Spinner size='sm' />
          </div>
        )}
      </div>
    </div>
  );
}

function HomepageEl({
  indicatorsMetaData = [],
  countriesList = [],
  cachedCountriesYes = [],
  cachedGlobeAvailability = [],
  globeAvailabilityLoading = false,
  countriesListLoading = false,
  countriesListError = false,
}: {
  indicatorsMetaData?: IndicatorsMetaDataType[];
  countriesList?: CountriesDataType[];
  cachedCountriesYes?: HomepageCountriesYes;
  cachedGlobeAvailability?: HomepageGlobeAvailability;
  globeAvailabilityLoading?: boolean;
  countriesListLoading?: boolean;
  countriesListError?: boolean;
}) {
  logTimelinePhase('HomepageEl render start');
  const safeCountriesList = Array.isArray(countriesList) ? countriesList : [];
  const safeIndicatorsMetaData = Array.isArray(indicatorsMetaData)
    ? indicatorsMetaData
    : [];
  const safeCachedCountriesYes = Array.isArray(cachedCountriesYes)
    ? cachedCountriesYes
    : [];
  const safeCachedGlobeAvailability = Array.isArray(cachedGlobeAvailability)
    ? cachedGlobeAvailability
    : [];
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [inViewSlide, setInViewSlide] = useState<number>(0);
  const [selectedSubIndicators, setSelectedSubIndicators] = useState<string[]>(
    [...new Set(safeIndicatorsMetaData.map(d => d.mainIndicatorId))].map(d => {
      const indicator = safeIndicatorsMetaData.find(
        el => el.mainIndicatorId === d,
      );
      return indicator ? getHomepageDefaultSubIndicatorId(indicator) : '';
    }),
  );
  const safeSelectedSubIndicator = Array.isArray(selectedSubIndicators)
    ? selectedSubIndicators
    : [];
  const [showNavigation, setShowNavigation] = useState(false);
  const isMobile = useIsMobileBreakpoint();

  const globeControlsRef = useRef<(HTMLDivElement | null)[]>([]);
  const pillarVisualizationRef = useRef<HTMLDivElement>(null);
  const countryLevelInsightsRef = useRef<HTMLDivElement>(null);

  const countryLevelInsightsInView = useInView(countryLevelInsightsRef, {
    once: false,
    amount: 0,
    margin: '0px 0px -25% 0px',
  });
  const scrollYProgressPillarVisualization = useScroll({
    target: pillarVisualizationRef,
    offset: ['start end', 'start center'],
  });
  const scrollYProgressCountryLevelInsights = useScroll({
    target: countryLevelInsightsRef,
    offset: ['start end', 'start center'],
  });

  const introductionOpacity = useTransform(
    scrollYProgressPillarVisualization.scrollYProgress,
    [0, 1],
    [1, 0],
  );
  const pillarVisualizationOpacity = useTransform(
    scrollYProgressCountryLevelInsights.scrollYProgress,
    [0, 1],
    [1, 0],
  );

  useEffect(() => {
    logTimelinePhase('HomepageEl mount & effects');
    const unsubscribe = introductionOpacity.on('change', latest => {
      setShowNavigation(latest < 0.25);
      if (latest > 0.5) {
        setSelectedId(undefined);
      }
    });

    return () => unsubscribe();
  }, [introductionOpacity]);

  useEffect(() => {
    const unsubscribe = pillarVisualizationOpacity.on('change', latest => {
      if (latest < 0.25) {
        setSelectedId(undefined);
      }
    });

    return () => unsubscribe();
  }, [pillarVisualizationOpacity]);

  const globeData = safeCachedGlobeAvailability;
  logTimelinePhase('Computed globeData for homepage');

  const activeSubIndicator =
    safeSelectedSubIndicator[inViewSlide] ||
    safeIndicatorsMetaData[inViewSlide]?.subIndicators?.[0]?.id ||
    safeIndicatorsMetaData[0]?.subIndicators?.[0]?.id;

  const activeMainIndicatorId = Number(
    safeSelectedSubIndicator[inViewSlide]?.split('_')[0],
  );

  const activeIndicator = safeIndicatorsMetaData.find(
    d => d.mainIndicatorId === activeMainIndicatorId,
  );

  const staticDashboardMap =
    activeMainIndicatorId === 1
      ? (staticDashboard1 as Record<string, CountryIndicatorDashboardResponse>)
      : activeMainIndicatorId === 2
        ? (staticDashboard2 as Record<
            string,
            CountryIndicatorDashboardResponse
          >)
        : null;
  const staticDashboardEntry =
    selectedId && staticDashboardMap
      ? staticDashboardMap[selectedId]
      : undefined;

  const { data: countryDashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['countryIndicatorDashboard', selectedId, activeMainIndicatorId],
    queryFn: () =>
      getCountryIndicatorDashboard(selectedId!, activeMainIndicatorId),
    enabled: !!selectedId && !!activeMainIndicatorId,
    staleTime: 1000 * 60 * 5,
    initialData: staticDashboardEntry,
    initialDataUpdatedAt: staticDashboardEntry ? 0 : undefined,
  });

  useEffect(() => {
    if (!isDev) return;
    const filtered = globeData.filter(
      d => d.indicatorId === activeSubIndicator,
    );
    console.warn('[ACC dev] HomepageEl slide/subIndicator', {
      inViewSlide,
      activeSubIndicator,
      globeAvailabilityLoading,
      countriesListLoading,
      countriesListError,
      countriesListCount: safeCountriesList.length,
      globeDataTotal: globeData.length,
      globeDataForActive: filtered.length,
      sampleForActive: filtered.slice(0, 3),
    });
  }, [
    inViewSlide,
    activeSubIndicator,
    globeAvailabilityLoading,
    countriesListLoading,
    countriesListError,
    safeCountriesList.length,
    globeData,
  ]);

  useEffect(() => {
    // Treat this as "homepage visible with main sections rendered"
    logTimelinePhase('HomepageEl main sections rendered');
    // After initial render, log the slowest loaded resources (JS chunks, images, etc.)
    logResourceSummary('Homepage', { minDurationMs: 50, limit: 30 });
    endTimeline('HomepageEl initial render complete');
    // We only want to log once on initial mount
  }, []);

  return (
    <div className='relative'>
      {showNavigation && (
        <Navigation
          inViewSlide={
            countryLevelInsightsInView
              ? safeIndicatorsMetaData.length
              : inViewSlide
          }
          globeControlsRef={globeControlsRef}
          countryLevelInsightsRef={countryLevelInsightsRef}
          indicatorsMetaData={safeIndicatorsMetaData.filter(d => !d.comingSoon)}
        />
      )}
      <div
        className='w-screen h-screen fixed top-0'
        style={{
          background:
            'linear-gradient(141.12deg, #0F0F0F -2.91%, #2D4351 44.74%, #437390 95.34%, #93DBFF 119.46%)',
        }}
      />
      {isMobile ? (
        <div className='relative flex flex-col pt-8'>
          <Introduction
            data={
              safeCountriesList.length
                ? safeCountriesList.map(c => ({
                    id: c['Alpha-3 code'],
                    x: 'Yes' as const,
                  }))
                : safeCachedCountriesYes
            }
            pillarVisualizationRef={pillarVisualizationRef}
            countryLevelInsightsRef={countryLevelInsightsRef}
            indicatorsMetaData={safeIndicatorsMetaData.filter(
              d => !d.comingSoon,
            )}
            globeControlsRef={globeControlsRef}
          />
        </div>
      ) : (
        <motion.div
          style={{ opacity: introductionOpacity }}
          className='sticky top-[184px] h-[calc(100vh-120px)] flex flex-col'
        >
          <Introduction
            data={
              safeCountriesList.length
                ? safeCountriesList.map(c => ({
                    id: c['Alpha-3 code'],
                    x: 'Yes' as const,
                  }))
                : safeCachedCountriesYes
            }
            pillarVisualizationRef={pillarVisualizationRef}
            countryLevelInsightsRef={countryLevelInsightsRef}
            indicatorsMetaData={safeIndicatorsMetaData.filter(
              d => !d.comingSoon,
            )}
            globeControlsRef={globeControlsRef}
          />
        </motion.div>
      )}
      {isMobile ? (
        <div ref={pillarVisualizationRef} className='relative z-5 pb-12'>
          {safeIndicatorsMetaData.map((d, i) => {
            const subIndicatorId =
              safeSelectedSubIndicator[i] || d.subIndicators[0]?.id;
            const subIndicator = d.subIndicators.find(
              sub => sub.id === subIndicatorId,
            );
            const filteredData = globeData
              .filter(gd => gd.indicatorId === subIndicatorId)
              .map(gd => ({
                countryCode: gd.countryCode,
                x: 'Yes',
                year: gd.year,
              }));
            return (
              <MobileGlobeItem
                key={i}
                index={i}
                indicator={d}
                subIndicator={subIndicator}
                subIndicatorId={subIndicatorId}
                filteredData={filteredData}
                globeAvailabilityLoading={globeAvailabilityLoading}
                globeControlsRef={globeControlsRef}
                setInViewSlide={setInViewSlide}
                setSelectedSubIndicators={setSelectedSubIndicators}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
              />
            );
          })}
        </div>
      ) : (
        <motion.div
          ref={pillarVisualizationRef}
          className='flex lg:flex-row z-5 relative top-[120px] pb-60'
          style={{
            opacity: pillarVisualizationOpacity,
          }}
        >
          <div className='lg:w-1/2 lg:px-10'>
            {safeIndicatorsMetaData.map((d, i) => (
              <div
                ref={el => {
                  globeControlsRef.current[i] = el;
                }}
                key={i}
              >
                <GlobeControls
                  onViewChange={el => {
                    setInViewSlide(el);
                  }}
                  heading={d.name}
                  description={d.description}
                  buttons={d.subIndicators.map(el => ({
                    label: el.name,
                    value: `${el.mainIndicatorId}_${el.subIndicatorId}`,
                    color: el.color,
                  }))}
                  onClick={el => {
                    setSelectedSubIndicators(prev =>
                      prev.map((v, idx) => (idx === i ? el : v)),
                    );
                  }}
                  index={i}
                />
              </div>
            ))}
          </div>
          {countriesListError ? (
            <div className='px-4 container mx-auto'>
              <ErrorState />
            </div>
          ) : activeSubIndicator ? (
            <GlobeComponent
              globeData={globeData}
              selectedSubIndicator={activeSubIndicator}
              countriesList={countriesListLoading ? [] : safeCountriesList}
              inViewSlide={inViewSlide}
              rotate={
                inViewSlide < safeIndicatorsMetaData.length ? true : false
              }
              indicatorsMetaData={safeIndicatorsMetaData}
              selectedIndicator={
                safeIndicatorsMetaData[inViewSlide] || safeIndicatorsMetaData[0]
              }
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              globeLoading={globeAvailabilityLoading || countriesListLoading}
            />
          ) : null}
        </motion.div>
      )}
      <div
        className='flex flex-col relative z-10'
        ref={countryLevelInsightsRef}
      >
        {countriesListLoading && (
          <div className='flex flex-col items-center gap-3 my-20'>
            <Spinner size='lg' />
            <ParagraphText size='sm' className='opacity-60'>
              Loading country insights...
            </ParagraphText>
          </div>
        )}
        {countriesListError && (
          <div className='px-4 container mx-auto'>
            <ErrorState />
          </div>
        )}
        {!countriesListError && !countriesListLoading ? (
          <CountryLevelInsight
            countriesList={safeCountriesList}
            indicatorsMetaData={safeIndicatorsMetaData}
          />
        ) : null}
        <div className='w-full my-20 px-4 lg:px-20'>
          <HeadingText type='h2'>Partnerships</HeadingText>
          <Spacer size='xl' />
          <ParagraphText>
            We've curated comprehensive datasets from Transparency
            International, World Bank, UNODC, OECD, and other respected
            institutions. Compare corruption indices, governance indicators, and
            specialized measurements - all accessible with one click in one
            comprehensive dashboard.
          </ParagraphText>
        </div>
      </div>
      {selectedId &&
        createPortal(
          isMobile ? (
          <div
            className='fixed inset-0 z-[998] flex items-center justify-center px-4'
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={e => {
              if (e.target === e.currentTarget) setSelectedId(undefined);
            }}
          >
          <div className='relative bg-[#fff] p-6 w-full max-w-[420px] rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.35)] z-[999] max-h-[85vh] overflow-y-auto'>
          
            <div
              style={{
                cursor: 'pointer',
                position: 'absolute',
                right: '0.5rem',
                top: '0.5rem',
              }}
              onClick={() => {
                setSelectedId(undefined);
              }}
            >
              <X color='#2D4858' size={32} strokeWidth={1} />
            </div>
            <div className='w-full flex flex-col items-center'>
              {(() => {
                const fromList = safeCountriesList.find(
                  el => el['Alpha-3 code'] === selectedId,
                );
                const fromUtils = getCountryDetailsFromISO3(selectedId);
                const alpha2 =
                  fromList?.['Alpha-2 code'] ?? fromUtils?.['Alpha-2 code'];
                const countryTitle =
                  fromList?.['Country or Area (official name)'] ??
                  fromUtils?.['Country or Area (official name)'] ??
                  selectedId;
                const flagUrl = alpha2
                  ? `http://purecatamphetamine.github.io/country-flag-icons/3x2/${alpha2}.svg`
                  : null;

                if (isDev) {
                  console.warn('[ACC dev] Country panel header data', {
                    selectedId,
                    countryTitle,
                    alpha2,
                    flagUrl,
                    countriesListCount: safeCountriesList.length,
                    hasFromUtils: Boolean(fromUtils),
                    pageProtocol:
                      typeof window !== 'undefined'
                        ? window.location.protocol
                        : '',
                  });
                }
                return (
                  <>
                    {alpha2 ? (
                      <img
                        alt=''
                        className='w-9 mb-3'
                        src={flagUrl as string}
                      />
                    ) : (
                      <div
                        className='w-9 h-6 mb-3 rounded bg-[#e8ecef] animate-pulse'
                        aria-hidden
                      />
                    )}
                    <ParagraphText
                      className='text-[var(--color-text-black)]'
                      alignment='center'
                      weight='semibold'
                      size='xl'
                    >
                      {countryTitle}
                    </ParagraphText>
                  </>
                );
              })()}
              <Spacer size='base' />
              {/* latestYear is number | null — renders nothing when null */}
              <ParagraphText
                className='text-[var(--color-text-black)]'
                alignment='center'
                weight='regular'
                size='sm'
              >
                {countryDashboard?.latestYear}
              </ParagraphText>
              <Spacer size='2xl' />
              {dashboardLoading ? (
                <div className='flex flex-col items-center gap-3 my-4'>
                  <Spinner size='sm' />
                </div>
              ) : (activeIndicator?.subIndicators?.length || 0) < 6 ? (
                <div className='w-full flex items-center text-primary-gray-500 justify-center'>
                  <ArcChart
                    data={(countryDashboard?.latestOverview ?? [])
                      .filter(
                        e => e.subIndicatorId != null && e.numericValue != null,
                      )
                      .map(e => {
                        // API returns sub-indicator codes (e.g. "corr_singleb"),
                        // but colors use composite ids (e.g. "1_2") from indicatorsMetaData.
                        // Translate so all three arrays share the same id format.
                        const compositeId =
                          mapGlobeSubIndicatorCodeToCompositeId(
                            e.subIndicatorId!,
                            safeIndicatorsMetaData,
                          ) ?? e.subIndicatorId!;
                        return { id: compositeId, value: e.numericValue! };
                      })}
                    subPillars={(countryDashboard?.latestOverview ?? [])
                      .filter(
                        e =>
                          e.subIndicatorId != null &&
                          e.subIndicatorName != null,
                      )
                      .map(e => {
                        const compositeId =
                          mapGlobeSubIndicatorCodeToCompositeId(
                            e.subIndicatorId!,
                            safeIndicatorsMetaData,
                          ) ?? e.subIndicatorId!;
                        return { id: compositeId, name: e.subIndicatorName! };
                      })}
                    colors={
                      activeIndicator?.subIndicators.map(s => ({
                        id: s.id,
                        color: s.color,
                      })) ?? []
                    }
                    suffix={activeIndicator?.suffix ?? ''}
                    maxValue={activeIndicator?.maxValue ?? 100}
                  />
                </div>
              ) : (
                <BarChartList
                  data={(countryDashboard?.latestOverview ?? [])
                    .filter(
                      e => e.subIndicatorName != null && e.numericValue != null,
                    )
                    .map(e => ({
                      id: e.subIndicatorName!,
                      value: e.numericValue!,
                    }))}
                  color={activeIndicator?.mainColor ?? '#fff'}
                  suffix={activeIndicator?.suffix ?? ''}
                  maxValue={activeIndicator?.maxValue ?? 100}
                  textClassName='text-[var(--color-text-black)]'
                  barBgColor='#d6d6d6'
                  isCardBgWhite
                />
              )}
              <Spacer size='2xl' />
              <Link
                to='/countries/$isoCode/{-$indicator}'
                params={{
                  isoCode: selectedId,
                  indicator: (
                    activeIndicator?.name ??
                    safeIndicatorsMetaData[inViewSlide]?.name ??
                    ''
                  )
                    .replaceAll(' ', '-')
                    .toLowerCase(),
                }}
              >
                <Button variant='primary'>View more →</Button>
              </Link>
            </div>
          </div>
          </div>
          ) : (
          <div className='fixed bottom-8 right-20 bg-[#fff] p-6 w-[360px] rounded-[8px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] z-[999] max-h-[80vh] overflow-y-auto'>
            <div
              style={{
                cursor: 'pointer',
                position: 'absolute',
                right: '0.5rem',
                top: '0.5rem',
              }}
              onClick={() => {
                setSelectedId(undefined);
              }}
            >
              <X color='#2D4858' size={32} strokeWidth={1} />
            </div>
            <div className='w-full flex flex-col items-center'>
              {(() => {
                const fromList = safeCountriesList.find(
                  el => el['Alpha-3 code'] === selectedId,
                );
                const fromUtils = getCountryDetailsFromISO3(selectedId);
                const alpha2 =
                  fromList?.['Alpha-2 code'] ?? fromUtils?.['Alpha-2 code'];
                const countryTitle =
                  fromList?.['Country or Area (official name)'] ??
                  fromUtils?.['Country or Area (official name)'] ??
                  selectedId;
                const flagUrl = alpha2
                  ? `http://purecatamphetamine.github.io/country-flag-icons/3x2/${alpha2}.svg`
                  : null;
                return (
                  <>
                    {alpha2 ? (
                      <img alt='' className='w-9 mb-3' src={flagUrl as string} />
                    ) : (
                      <div className='w-9 h-6 mb-3 rounded bg-[#e8ecef] animate-pulse' aria-hidden />
                    )}
                    <ParagraphText
                      className='text-[var(--color-text-black)]'
                      alignment='center'
                      weight='semibold'
                      size='xl'
                    >
                      {countryTitle}
                    </ParagraphText>
                  </>
                );
              })()}
              <Spacer size='base' />
              <ParagraphText
                className='text-[var(--color-text-black)]'
                alignment='center'
                weight='regular'
                size='sm'
              >
                {countryDashboard?.latestYear}
              </ParagraphText>
              <Spacer size='2xl' />
              {dashboardLoading ? (
                <div className='flex flex-col items-center gap-3 my-4'>
                  <Spinner size='sm' />
                </div>
              ) : (activeIndicator?.subIndicators?.length || 0) < 6 ? (
                <div className='w-full flex items-center text-primary-gray-500 justify-center'>
                  <ArcChart
                    data={(countryDashboard?.latestOverview ?? [])
                      .filter(
                        e => e.subIndicatorId != null && e.numericValue != null,
                      )
                      .map(e => {
                        const compositeId =
                          mapGlobeSubIndicatorCodeToCompositeId(
                            e.subIndicatorId!,
                            safeIndicatorsMetaData,
                          ) ?? e.subIndicatorId!;
                        return { id: compositeId, value: e.numericValue! };
                      })}
                    subPillars={(countryDashboard?.latestOverview ?? [])
                      .filter(
                        e =>
                          e.subIndicatorId != null &&
                          e.subIndicatorName != null,
                      )
                      .map(e => {
                        const compositeId =
                          mapGlobeSubIndicatorCodeToCompositeId(
                            e.subIndicatorId!,
                            safeIndicatorsMetaData,
                          ) ?? e.subIndicatorId!;
                        return { id: compositeId, name: e.subIndicatorName! };
                      })}
                    colors={
                      activeIndicator?.subIndicators.map(s => ({
                        id: s.id,
                        color: s.color,
                      })) ?? []
                    }
                    suffix={activeIndicator?.suffix ?? ''}
                    maxValue={activeIndicator?.maxValue ?? 100}
                  />
                </div>
              ) : (
                <BarChartList
                  data={(countryDashboard?.latestOverview ?? [])
                    .filter(
                      e => e.subIndicatorName != null && e.numericValue != null,
                    )
                    .map(e => ({
                      id: e.subIndicatorName!,
                      value: e.numericValue!,
                    }))}
                  color={activeIndicator?.mainColor ?? '#fff'}
                  suffix={activeIndicator?.suffix ?? ''}
                  maxValue={activeIndicator?.maxValue ?? 100}
                  textClassName='text-[var(--color-text-black)]'
                  barBgColor='#d6d6d6'
                  isCardBgWhite
                />
              )}
              <Spacer size='2xl' />
              <Link
                to='/countries/$isoCode/{-$indicator}'
                params={{
                  isoCode: selectedId,
                  indicator: (
                    activeIndicator?.name ??
                    safeIndicatorsMetaData[inViewSlide]?.name ??
                    ''
                  )
                    .replaceAll(' ', '-')
                    .toLowerCase(),
                }}
              >
                <Button variant='primary'>View more →</Button>
              </Link>
            </div>
          </div>
          ),
          document.getElementById('root') as HTMLElement,
        )}
    </div>
  );
}

export default HomepageEl;
