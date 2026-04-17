import * as THREE from 'three';
import { motion } from 'motion/react';
import { Spinner } from '@undp/design-system-react/Spinner';
import { getCountryDetailsFromISO3 } from '@undp-data/data-utils';
import { ThreeDGlobe } from '@undp/data-viz/ThreeDGlobe';
import { transformDataForGraph } from '@undp/data-viz/transformData';

import { CountriesDataType, IndicatorsMetaDataType } from '@/Types';
import { ParagraphText } from '@/Components/Typography';
import { logTimelinePhase } from '@/logging/loadTimeLogger';

const isDev =
  typeof import.meta !== 'undefined' &&
  (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true;

interface Props {
  globeData: {
    countryCode: string;
    indicatorId: string;
    year: number;
  }[];
  selectedSubIndicator: string;
  countriesList: CountriesDataType[];
  rotate: boolean;
  selectedIndicator: IndicatorsMetaDataType;
  indicatorsMetaData: IndicatorsMetaDataType[];
  inViewSlide: number;
  selectedId?: string;
  setSelectedId: (id: string) => void;
  globeLoading?: boolean;
}

function GlobeComponent({
  globeData,
  selectedSubIndicator,
  rotate,
  indicatorsMetaData,
  selectedId,
  setSelectedId,
  countriesList,
  globeLoading = false,
}: Props) {
  logTimelinePhase('GlobeComponent render start');
  const hasAnyGlobeData = globeData.length !== 0;
  const filteredCount = globeData.filter(
    d => d.indicatorId === selectedSubIndicator,
  ).length;

  if (isDev) {
    console.warn('[ACC dev] GlobeComponent render', {
      globeLoading,
      rotate,
      selectedSubIndicator,
      selectedId,
      globeDataTotal: globeData.length,
      globeDataFiltered: filteredCount,
      countriesListCount: countriesList?.length ?? 0,
    });
  }

  return (
    <>
      <div className='w-1/2 sticky top-[120px] h-[calc(100vh-120px)] hidden lg:flex flex-col py-24 pl-10 pr-30'>
        {globeLoading ? (
          <div
            className='relative z-20 flex w-full shrink-0 items-center gap-3 mb-3'
            role='status'
            aria-live='polite'
            aria-label='Loading map data'
          >
            <div
              className='relative min-h-2 flex-1 overflow-hidden rounded-full bg-white/25 shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]'
              role='progressbar'
              aria-busy='true'
            >
              <motion.div
                className='absolute inset-y-0 left-0 w-2/5 rounded-full bg-[#61D4F8] shadow-[0_0_12px_rgba(97,212,248,0.75)]'
                animate={{ x: ['-100%', '420%'] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.15,
                  ease: 'linear',
                }}
              />
            </div>
            <Spinner size='sm' className='shrink-0 text-[#61D4F8]' />
          </div>
        ) : null}
        <div className='w-full grow flex radialGradientMask'>
          {hasAnyGlobeData ? (
            <ThreeDGlobe
              showColorScale={false}
              polygonAltitude={0.005}
              highlightedAltitude={0.01}
              colors={[
                indicatorsMetaData
                  .map(d => d.subIndicators)
                  .flat()
                  .find(d => d.id === selectedSubIndicator)
                  ?.colors.split(',')[0] as string,
              ]}
              selectedId={selectedId}
              onSeriesMouseClick={d => {
                if (isDev) {
                  console.warn('[ACC dev] Globe click', {
                    clickedId: d?.id,
                    clickedYear: d?.data?.year,
                    selectedSubIndicator,
                  });
                }
                setSelectedId(d.id);
              }}
              colorDomain={['Yes']}
              scale={
                (window.innerWidth / 2 - 160) / (window.innerHeight - 200) >
                0.95
                  ? 1.5
                  : (window.innerWidth / 2 - 160) / (window.innerHeight - 200) >
                      0.9
                    ? 1.75
                    : (window.innerWidth / 2 - 160) /
                          (window.innerHeight - 200) >
                        0.8
                      ? 2
                      : (window.innerWidth / 2 - 160) /
                            (window.innerHeight - 200) >
                          0.7
                        ? 2.5
                        : 3
              }
              footNote=''
              enableZoom={false}
              atmosphereColor={
                indicatorsMetaData
                  .map(d => d.subIndicators)
                  .flat()
                  .find(d => d.id === selectedSubIndicator)?.color
              }
              globeMaterial={
                new THREE.MeshBasicMaterial({
                  color: 0xfafafa,
                })
              }
              tooltip={d => {
                const fromList = countriesList.find(
                  c => c['Alpha-3 code'] === d.id,
                );
                const fromUtils = getCountryDetailsFromISO3(d.id);
                const title =
                  fromList?.['Country or Area (official name)'] ??
                  fromUtils?.['Country or Area (official name)'];

                if (isDev && !title) {
                  console.warn('[ACC dev] Globe tooltip missing title', {
                    hoveredId: d?.id,
                    countriesListCount: countriesList?.length ?? 0,
                    hasFromUtils: Boolean(fromUtils),
                    fromUtilsSample: fromUtils ?? null,
                  });
                }
                return (
                  <div>
                    <ParagraphText
                      size='xs'
                      weight='bold'
                      className='text-black'
                    >
                      {title}
                    </ParagraphText>
                  </div>
                );
              }}
              fogSettings={{
                color:
                  indicatorsMetaData
                    .map(d => d.subIndicators)
                    .flat()
                    .find(d => d.id === selectedSubIndicator)?.color || '#fff',
                near:
                  (window.innerWidth / 2 - 160) / (window.innerHeight - 200) >
                  0.9
                    ? 150
                    : (window.innerWidth / 2 - 160) /
                          (window.innerHeight - 200) >
                        0.8
                      ? 200
                      : (window.innerWidth / 2 - 160) /
                            (window.innerHeight - 200) >
                          0.7
                        ? 250
                        : 300,
                far:
                  (window.innerWidth / 2 - 160) / (window.innerHeight - 200) >
                  0.9
                    ? 300
                    : (window.innerWidth / 2 - 160) /
                          (window.innerHeight - 200) >
                        0.8
                      ? 350
                      : (window.innerWidth / 2 - 160) /
                            (window.innerHeight - 200) >
                          0.7
                        ? 400
                        : 450,
              }}
              atmosphereAltitude={0.1}
              globeCurvatureResolution={2}
              resetSelectionOnDoubleClick={false}
              autoRotate={rotate ? 1 : false}
              data={transformDataForGraph(
                globeData
                  .filter(d => d.indicatorId === selectedSubIndicator)
                  .map(d => ({
                    countryCode: d.countryCode,
                    x: 'Yes',
                    year: d.year,
                  })),
                'threeDGlobe',
                [
                  { chartConfigId: 'id', columnId: 'countryCode' },
                  { chartConfigId: 'x', columnId: 'x' },
                ],
              )}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}

export default GlobeComponent;
