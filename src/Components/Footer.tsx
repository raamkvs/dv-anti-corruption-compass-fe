import { Link } from '@tanstack/react-router';
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
} from 'lucide-react';
import { Spacer } from '@undp/design-system-react/Spacer';

import { ParagraphText } from './Typography';

import { IndicatorsMetaDataType } from '@/Types';

export const Footer = ({
  indicatorsMetaData,
  indicatorsMetaDataLoading,
}: {
  indicatorsMetaData: IndicatorsMetaDataType[];
  indicatorsMetaDataLoading: boolean;
}) => {
  return (
    <footer className='bg-[#437390] px-4 lg:px-16 py-12 lg:py-24 relative z-10'>
      <div className='flex flex-wrap flex-col lg:flex-row gap-4 md:gap-12 lg:gap-0'>
        <div className='w-full lg:w-1/3'>
          <ParagraphText size='sm'>
            Copyright © 2025 Anti Corruption Compass
          </ParagraphText>
          <Spacer size='5xl' />
          <div className='flex gap-8'>
            <FacebookIcon />
            <TwitterIcon />
            <InstagramIcon />
            <YoutubeIcon />
          </div>
        </div>
        <div className='w-full flex gap-4 justify-start flex-col md:flex-row md:justify-between lg:w-2/3 lg:justify-end md:gap-4 lg:gap-16'>
          <Link to='/'>
            <ParagraphText>Home</ParagraphText>
          </Link>
          <div className='flex flex-col gap-4 md:gap-8'>
            {indicatorsMetaDataLoading && (
              <ParagraphText>Loading...</ParagraphText>
            )}
            {indicatorsMetaData.map((d, i) => (
              <Link
                to='/main-indicators/{-$indicator}'
                params={{
                  indicator: d.name.replaceAll(' ', '-').toLowerCase(),
                }}
                key={i}
              >
                <ParagraphText>{d.name}</ParagraphText>
              </Link>
            ))}
          </div>
          <Link to='/countries'>
            <ParagraphText>Country Profile</ParagraphText>
          </Link>
          <Link to='/methodology'>
            <ParagraphText>Methodology</ParagraphText>
          </Link>
          <Link to='/about'>
            <ParagraphText>About Us</ParagraphText>
          </Link>
        </div>
      </div>
    </footer>
  );
};
