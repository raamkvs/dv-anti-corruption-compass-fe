import { useEffect, useRef, useState, useEffectEvent } from 'react';
import { Spinner } from '@undp/design-system-react/Spinner';
import { Spacer } from '@undp/design-system-react/Spacer';

import { HeadingText } from '../Typography';

import { Graph } from './Graph';

import { DataType, IndicatorsMetaDataType } from '@/Types';
import { useIsMobileBreakpoint } from '@/Utils/useIsMobileBreakpoint';

interface Props {
  data: DataType[];
  innerRadiusRatio?: number;
  indicatorMetaData: IndicatorsMetaDataType;
  maxValue?: number;
  year: number;
}

export const PolarBarChart = ({
  data,
  innerRadiusRatio = 0.6,
  indicatorMetaData,
  maxValue = 100,
  year,
}: Props) => {
  const isMobile = useIsMobileBreakpoint();
  const [radius, setRadius] = useState(0);
  const marginSide = isMobile ? 72 : 100;
  const marginTop = isMobile ? 56 : 100;
  const graphDiv = useRef<HTMLDivElement>(null);
  const setRadiusEvent = useEffectEvent(() => {
    if (graphDiv.current) {
      setRadius((graphDiv.current.clientWidth || 620) / 2);
    }
  });
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      setRadius((entries[0].target.clientWidth || 620) / 2);
    });
    if (graphDiv.current) {
      setRadiusEvent();
      resizeObserver.observe(graphDiv.current);
    }
    return () => resizeObserver.disconnect();
  }, []);
  return (
    <>
      <Spacer size='base' />
      <HeadingText type='h3' alignment='center'>
        {year}
      </HeadingText>
      <Spacer size='4xl' />
      <div
        className={`bg-transparent ${isMobile ? 'w-full flex justify-end pr-2' : 'container-sm'}`}
        ref={graphDiv}
      >
        {radius > 0 && (
          <Graph
            data={data}
            radius={radius - marginSide}
            innerRadiusRatio={innerRadiusRatio}
            marginSide={marginSide}
            marginTop={marginTop}
            indicatorMetaData={indicatorMetaData}
            maxValue={maxValue}
            isMobile={isMobile}
          />
        )}
        {radius === 0 && <Spinner size='lg' className='my-20 m-auto' />}
      </div>
    </>
  );
};
