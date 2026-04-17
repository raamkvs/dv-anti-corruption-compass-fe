import { Link } from '@tanstack/react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@undp/design-system-react/DropdownMenu';
import { ChevronDown, Globe, Menu, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Modal } from '@undp/design-system-react/Modal';

import { HeadingText, ParagraphText } from '../Typography';
import { SearchPalette } from '../SearchPalette';

import { CountryList } from './CountryList';

import { CountriesDataType, IndicatorsMetaDataType } from '@/Types';

export const Header = ({
  indicatorsMetaData,
  countriesListDataLoading,
  countriesListDataError,
  countriesListData,
}: {
  indicatorsMetaData: IndicatorsMetaDataType[];
  countriesListDataLoading: boolean;
  countriesListDataError: boolean;
  countriesListData: CountriesDataType[];
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showCountrySelection, setShowCountrySelection] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header
        className='fixed flex justify-between top-0 w-full px-4 lg:px-16 py-6 lg:py-9 z-50 background-inherit'
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1.5rem)' }}
      >
        <Link to='/'>
          <div className='flex items-center gap-4'>
            <img src='/imgs/Logo.svg' alt='Example' className='w-7.5 h-auto' />
            <div className='flex items-center gap-2'>
              <HeadingText
                type='h3'
                weight='bold'
                alignment='center'
                marginBottom='none'
              >
                Anti Corruption Compass
              </HeadingText>
              <div className='bg-[#4B6E91] text-[var(--color-text-white)] px-2 py-1 rounded-[4px] poppins-semibold text-xs'>
                beta
              </div>
            </div>
          </div>
        </Link>
        <div className='items-center gap-16 hidden lg:flex'>
          <Link to='/'>
            <ParagraphText
              alignment='center'
              size='lg'
              weight='medium'
              leading='none'
            >
              Home
            </ParagraphText>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className='flex items-center gap-2'>
                <ParagraphText
                  alignment='center'
                  size='lg'
                  weight='medium'
                  leading='none'
                >
                  Main indicators
                </ParagraphText>
                <ChevronDown strokeWidth={3} size={16} color='#fff' />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-60 rounded-[8px] mt-2 p-0 z-1000 border-none shadow-[0_2px_4px_0_rgba(0,0,0,0.25)]'>
              {(indicatorsMetaData || []).map((d, i) => (
                <DropdownMenuItem
                  key={i}
                  asChild
                  className='poppins-medium !text-[14px] py-4 px-3 hover:!bg-[#4B6E91] text-[var(--color-black-bg)] hover:!text-[var(--color-text-white)]'
                >
                  <Link
                    to='/main-indicators/{-$indicator}'
                    params={{
                      indicator: d.name.replaceAll(' ', '-').toLowerCase(),
                    }}
                  >
                    <ParagraphText
                      alignment='center'
                      size='sm'
                      weight='medium'
                      className='text-[inherit]'
                    >
                      {d.name}
                    </ParagraphText>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to='/countries'>
            <ParagraphText
              alignment='center'
              size='lg'
              weight='medium'
              leading='none'
            >
              Country Profile
            </ParagraphText>
          </Link>
          <Link to='/methodology'>
            <ParagraphText
              alignment='center'
              size='lg'
              weight='medium'
              leading='none'
            >
              Methodology
            </ParagraphText>
          </Link>
          <Link to='/about'>
            <ParagraphText
              alignment='center'
              size='lg'
              weight='medium'
              leading='none'
            >
              About Us
            </ParagraphText>
          </Link>
        </div>
        <div className='hidden lg:flex items-center gap-6'>
          <button
            type='button'
            className='flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity'
            onClick={() => setShowSearch(true)}
          >
            <Search size={16} color='#fff' />
            <span className='poppins-regular !text-[14px] text-[var(--color-text-white)] opacity-60'>
              Search...
            </span>
            <span className='bg-[#FFFFFF1F] rounded-[4px] px-2 py-0.5 poppins-medium !text-[11px] text-[var(--color-text-white)]'>
              ⌘K
            </span>
          </button>
          <button
            type='button'
            className='m-0 p-0 cursor-pointer'
            onClick={() => {
              setShowCountrySelection(true);
            }}
          >
            <Globe color='#fff' size={28} />
          </button>
        </div>
        <div className='grow justify-end gap-8 flex lg:hidden'>
          <button
            type='button'
            className='m-0 p-0 cursor-pointer'
            onClick={() => setShowSearch(true)}
          >
            <Search className='w-8 h-8 stroke-white' />
          </button>
          <button
            type='button'
            onClick={() => {
              setShowMenu(!showMenu);
            }}
          >
            {showMenu ? (
              <X className='w-10 h-10 stroke-white' />
            ) : (
              <Menu className='w-10 h-10 stroke-white' />
            )}
          </button>
          {showMenu ? (
            <div className='box-border h-[calc(100vh-120px)] left-0 m-0 overflow-y-auto p-5 absolute top-full w-full backdrop-blur-[18px] bg-[#2D4858]'>
              <div className='flex flex-col justify-start items-start gap-8'>
                <ParagraphText size='sm' weight='medium' leading='none'>
                  Main indicators
                </ParagraphText>
                <div className='flex flex-col justify-start items-start gap-8 pl-5'>
                  {indicatorsMetaData.map((d, i) => (
                    <Link
                      key={i}
                      to='/main-indicators/{-$indicator}'
                      params={{
                        indicator: d.name.replaceAll(' ', '-').toLowerCase(),
                      }}
                      onClick={() => setShowMenu(false)}
                    >
                      <ParagraphText size='sm' weight='medium' leading='none'>
                        {d.name}
                      </ParagraphText>
                    </Link>
                  ))}
                </div>
                <Link to='/methodology' onClick={() => setShowMenu(false)}>
                  <ParagraphText size='sm' weight='medium' leading='none'>
                    Methodology
                  </ParagraphText>
                </Link>
                <Link to='/countries' onClick={() => setShowMenu(false)}>
                  <ParagraphText size='sm' weight='medium' leading='none'>
                    Country Profile
                  </ParagraphText>
                </Link>
                <Link to='/about' onClick={() => setShowMenu(false)}>
                  <ParagraphText size='sm' weight='medium' leading='none'>
                    About Us
                  </ParagraphText>
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </header>
      {showCountrySelection && (
        <Modal
          open={showCountrySelection}
          overlayClassName='modal-overlay'
          onClose={() => {
            setShowCountrySelection(false);
          }}
          className='bg-[#F5F5F5]! border-0! rounded-lg!'
        >
          <CountryList
            countriesListData={countriesListData || []}
            countriesListDataLoading={countriesListDataLoading}
            countriesListDataError={countriesListDataError}
            setShowCountrySelection={setShowCountrySelection}
            mode='light'
          />
        </Modal>
      )}
      <SearchPalette open={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
};
