import { DropdownSelect } from '@undp/design-system-react/DropdownSelect';
import { Spinner } from '@undp/design-system-react/Spinner';
import { useNavigate } from '@tanstack/react-router';

import { HeadingText, ParagraphText } from './Typography';

import { CountriesDataType } from '@/Types';
import { DROPDOWN_CLASSNAMES } from '@/Constants';
import { customDropdownComponents } from '@/Utils/DropdownComponents';

export const CountrySelect = ({
  countriesList,
  heading,
  description,
}: {
  countriesList: CountriesDataType[];
  heading: string;
  description: string;
}) => {
  const navigate = useNavigate();
  return (
    <div className='gap-8 flex flex-col w-full text-primary-gray-700 pt-7'>
      <div className='flex flex-col gap-3'>
        <HeadingText type='h2'>{heading}</HeadingText>
        <ParagraphText leading='snug'>{description}</ParagraphText>
      </div>
      {countriesList.length > 0 ? (
        <DropdownSelect
          placeholder='Select country'
          options={countriesList.map(d => ({
            label: d['Country or Area (official name)'],
            value: d['Alpha-3 code'],
          }))}
          onChange={d => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            navigate({ to: `/countries/${(d as any).value}` });
          }}
          size='base'
          variant='normal'
          className='bg-primary-white! border-0! rounded-full! px-4!'
          classNames={DROPDOWN_CLASSNAMES}
          components={customDropdownComponents('light', false)}
        />
      ) : (
        <div className='flex items-center gap-3'>
          <Spinner />
          <ParagraphText size='sm'>Loading countries...</ParagraphText>
        </div>
      )}
    </div>
  );
};
