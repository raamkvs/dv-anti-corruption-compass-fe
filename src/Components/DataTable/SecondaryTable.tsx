import { Spinner } from '@undp/design-system-react/Spinner';
import { Badge } from '@undp/design-system-react/Badge';
import { Link } from '@tanstack/react-router';
import { Spacer } from '@undp/design-system-react/Spacer';
import { useState } from 'react';
import { getTextColorBasedOnBgColor } from '@undp/data-viz/utils';
import { Pagination } from '@undp/design-system-react/Pagination';

import { CountriesDataType, DataType } from '@/Types';
import { useIsMobileBreakpoint } from '@/Utils/useIsMobileBreakpoint';

interface Props {
  data: DataType[];
  colors: string[];
  countriesList: CountriesDataType[];
  suffix: string;
}

function DataTableSimple({ data, colors = [], countriesList, suffix }: Props) {
  const isMobile = useIsMobileBreakpoint();
  const [page, setPage] = useState(1);
  const pageLength = 10;
  return (
    <div className='gap-4.5 flex flex-col w-full text-primary-gray-700'>
      <div className='dark'>
        {!isMobile && (
          <div className='flex w-full pb-2 border-b border-b-primary-white'>
            <div className='poppins-semibold text-[16px]! text-primary-white! w-[45%] pr-4!'>
              Country name
            </div>
            <div className='poppins-semibold text-[16px]! text-primary-white! w-[25%] pr-4!'>
              Indicator value
            </div>
            <div className='poppins-semibold text-[16px]! text-primary-white! w-[15%] pr-4!'>
              Value
            </div>
            <div className='poppins-semibold text-[16px]! text-primary-white! w-[15%] pr-4!' />
          </div>
        )}
        <div>
          {data.length > 0 ? (
            data
              .filter(
                (_el, i) =>
                  i < page * pageLength && i >= (page - 1) * pageLength,
              )
              .map((el, i) => {
                const countryName = countriesList.find(
                  c => c['Alpha-3 code'] === el.countryCode,
                )?.['Country or Area (official name)'];
                const badgeBg = !el.indicatorValue
                  ? '#DADADA'
                  : ['LOW', 'MEDIUM', 'HIGH'].indexOf(el.indicatorValue) !== -1
                    ? colors[
                        ['LOW', 'MEDIUM', 'HIGH'].indexOf(el.indicatorValue)
                      ]
                    : '#DADADA';
                const badgeColor = !el.indicatorValue
                  ? '#000'
                  : getTextColorBasedOnBgColor(
                      ['LOW', 'MEDIUM', 'HIGH'].indexOf(el.indicatorValue) !==
                        -1
                        ? colors[
                            ['LOW', 'MEDIUM', 'HIGH'].indexOf(el.indicatorValue)
                          ]
                        : '#DADADA',
                    );
                const valueStr =
                  el.numericValue === null || el.numericValue === undefined
                    ? 'NA'
                    : el.numericValue.toFixed(2) + suffix;

                return (
                  <div key={i}>
                    {isMobile ? (
                      <div className='py-4 border-b border-b-[0.5px] border-b-primary-white'>
                        <div className='flex justify-between items-center mb-2'>
                          <span className='poppins-medium text-[14px] text-primary-white'>
                            {countryName}
                          </span>
                          <Link
                            to='/countries/$isoCode/{-$indicator}'
                            className='poppins-medium text-[13px] text-primary-white opacity-100 hover:opacity-80 underline underline-offset-4 shrink-0 ml-2'
                            params={{ isoCode: el.countryCode }}
                          >
                            View Details
                          </Link>
                        </div>
                        <div className='flex items-center gap-3 flex-wrap'>
                          <Badge
                            rounded='full'
                            className='poppins-medium py-0 text-[11px]! px-2!'
                            style={{
                              backgroundColor: badgeBg,
                              color: badgeColor,
                            }}
                          >
                            {el.indicatorValue || 'NA'}
                          </Badge>
                          <span className='poppins-light text-[13px] text-primary-white'>
                            {valueStr}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className='flex w-full py-4 border-b border-b-[0.5px] border-b-primary-white items-center'>
                        <div className='poppins-light text-[16px]! text-primary-white! w-[45%] pr-4!'>
                          {countryName}
                        </div>
                        <div className='poppins-light text-[16px]! text-primary-white! w-[25%] pr-4!'>
                          <Badge
                            rounded='full'
                            className='poppins-medium py-0 text-[12px]! px-3!'
                            style={{
                              backgroundColor: badgeBg,
                              color: badgeColor,
                            }}
                          >
                            {el.indicatorValue || 'NA'}
                          </Badge>
                        </div>
                        <div className='poppins-light text-[16px]! text-primary-white! w-[15%] pr-4!'>
                          {valueStr}
                        </div>
                        <Link
                          to='/countries/$isoCode/{-$indicator}'
                          className='poppins-light text-[16px]! text-primary-white! w-[15%] pr-4! opacity-100 hover:opacity-80 underline underline-offset-4'
                          params={{ isoCode: el.countryCode }}
                        >
                          View Details
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })
          ) : (
            <Spinner />
          )}
        </div>
        <Spacer size='5xl' />
        <Pagination
          total={data.length}
          pageSize={pageLength}
          onChange={page => {
            setPage(page);
          }}
        />
      </div>
    </div>
  );
}

export default DataTableSimple;
