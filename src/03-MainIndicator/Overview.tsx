import { ArrowDown } from 'lucide-react';

import { HeadingText, ParagraphText } from '@/Components/Typography';

interface Props {
  title: string;
  description: string;
  hideDownArrow?: boolean;
}

function CountryPageEl({ title, description, hideDownArrow }: Props) {
  return (
    <div className='flex items-center justify-center gap-1 flex-col mt-8 lg:mt-16 mb-8 lg:mb-16'>
      <div className='flex flex-col gap-8 justify-center items-center container m-auto px-4'>
        <HeadingText type='h1'>{title}</HeadingText>
        <ParagraphText alignment='center' size='lg'>
          {description}
        </ParagraphText>
        {hideDownArrow ? null : (
          <div className='left-[50%] translate-x-[-50%] rounded-full bg-primary-white w-[40px] h-[40px] flex justify-center items-center'>
            <ArrowDown color='#437390' size={18} strokeWidth={3} />
          </div>
        )}
      </div>
    </div>
  );
}

export default CountryPageEl;
