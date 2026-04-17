import { Spacer } from '@undp/design-system-react/Spacer';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';

import { CountriesDataType } from '@/Types';
import { HeadingText, ParagraphText } from '@/Components/Typography';

type Props = {
  countriesListData: CountriesDataType[];
  alphabets: string[];
};

export function MobileCountriesListing({
  countriesListData,
  alphabets,
}: Props) {
  const [search, setSearch] = useState('');

  const filtered = countriesListData
    .filter(country => {
      const name = country['Country or Area (official name)'];
      return name.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) =>
      a['Country or Area (official name)'].localeCompare(
        b['Country or Area (official name)'],
      ),
    );

  const groupedCountries = filtered.reduce<Record<string, CountriesDataType[]>>(
    (acc, country) => {
      const letter = country['Country or Area (official name)'][0].toUpperCase();
      if (!acc[letter]) acc[letter] = [];
      acc[letter].push(country);
      return acc;
    },
    {},
  );

  const sortedLetters = [...alphabets].sort((a, b) => a.localeCompare(b));

  return (
    <div className='container mx-auto px-4'>
      <Spacer size='4xl' />
      <HeadingText type='h2'>Country profile</HeadingText>
      <Spacer size='2xl' />
      <div className='mb-6'>
        <input
          type='text'
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder='Search countries'
          className='w-full rounded-[8px] px-4 py-3 text-black text-sm'
        />
      </div>
      <div className='flex flex-wrap gap-2 mb-4 sticky top-[var(--app-header-sticky-offset)] z-10 bg-inherit py-2'>
        {sortedLetters.map(letter => (
          <button
            key={letter}
            type='button'
            className='min-h-[44px] px-3 py-1 rounded-full border border-white/40 text-xs'
            onClick={() => {
              const el = document.getElementById(`alpha-${letter}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          >
            {letter}
          </button>
        ))}
      </div>
      <div className='flex flex-col gap-4'>
        {sortedLetters
          .filter(letter => groupedCountries[letter]?.length)
          .map(letter => (
            <section id={`alpha-${letter}`} key={letter} className='scroll-mt-30'>
              <ParagraphText
                size='sm'
                weight='bold'
                className='uppercase opacity-80 mb-2'
              >
                {letter}
              </ParagraphText>
              <div className='flex flex-col'>
                {groupedCountries[letter].map(country => (
                  <Link
                    key={country['Alpha-3 code']}
                    to='/countries/$isoCode/{-$indicator}'
                    params={{ isoCode: country['Alpha-3 code'] }}
                    className='min-h-[44px] py-3 border-b border-white/10'
                  >
                    <ParagraphText size='sm' weight='medium'>
                      {country['Country or Area (official name)']}
                    </ParagraphText>
                  </Link>
                ))}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}
