import { Fragment } from 'react/jsx-runtime';
import { RefObject } from 'react';

import { ScrollToObj } from '@/Utils/ScrollToObj';
import { IndicatorsMetaDataType } from '@/Types';
import { ParagraphText } from '@/Components/Typography';

interface Props {
  inViewSlide: number;
  countryLevelInsightsRef: RefObject<HTMLDivElement | null>;
  globeControlsRef: RefObject<(HTMLDivElement | null)[]>;
  indicatorsMetaData: IndicatorsMetaDataType[];
}
const Navigation = (props: Props) => {
  const {
    inViewSlide,
    globeControlsRef,
    countryLevelInsightsRef,
    indicatorsMetaData,
  } = props;
  return (
    <div className='fixed z-20 hidden lg:flex flex-col gap-0 justify-center items-center right-8 top-[50%] transform-[translate(0, -50%)'>
      {indicatorsMetaData.map((d, i) => (
        <Fragment key={i}>
          <div className='flex gap-2 items-center'>
            <div className='flex items-center h-4 w-20 text-right'>
              <ParagraphText
                size='xs'
                className={`pointer-events-none text-right w-20 ${inViewSlide === i ? 'hidden md:block' : 'hidden'}`}
              >
                {d.name}
              </ParagraphText>
            </div>
            <div
              className={`cursor-pointer rounded-full w-5 h-5 border-1 border-[#fff] pointer-events-auto ${inViewSlide === i ? 'bg-[#fff]' : 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.5),rgba(7,43,78,0.5))]'}`}
              onClick={() => {
                ScrollToObj(globeControlsRef.current[i]);
              }}
            />
          </div>
          <div className='pointer-events-none ml-22 my-2 w-[1px] h-10 border-l border-dashed border-white' />
        </Fragment>
      ))}
      <div className='flex gap-2 items-center'>
        <div className='flex items-center h-4 w-20 text-right'>
          <ParagraphText
            size='xs'
            className={`pointer-events-none text-right w-20 ${inViewSlide === indicatorsMetaData.length ? 'hidden md:block' : 'hidden'}`}
          >
            Country level insights
          </ParagraphText>
        </div>
        <div
          className={`cursor-pointer rounded-full w-5 h-5 border-1 border-[#fff] pointer-events-auto ${inViewSlide === indicatorsMetaData.length ? 'bg-[#fff]' : 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.5),rgba(7,43,78,0.5))]'}`}
          onClick={() => {
            ScrollToObj(countryLevelInsightsRef.current);
          }}
        />
      </div>
    </div>
  );
};

export default Navigation;
