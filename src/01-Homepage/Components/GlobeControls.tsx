import { Link } from '@tanstack/react-router';
import { useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { DropdownSelect } from '@undp/design-system-react/DropdownSelect';

import { HeadingText, ParagraphText } from '@/Components/Typography';
import { Button } from '@/Components/Button';
import { DROPDOWN_CLASSNAMES } from '@/Constants';
import { customDropdownComponents } from '@/Utils/DropdownComponents';

interface Props {
  heading: string;
  description: string;
  isLastSection?: boolean;
  buttons?: { label: string; value: string }[];
  onClick: (_d: string) => void;
  onViewChange: (_d: number) => void;
  index: number;
}

const GlobeControls = (props: Props) => {
  const {
    heading,
    description,
    buttons = [],
    onClick,
    isLastSection,
    onViewChange,
    index,
  } = props;
  const [activeButton, setActiveButton] = useState(buttons[0]);
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: false, amount: 0.6 });
  useEffect(() => {
    if (isInView) {
      onViewChange(index);
    }
  }, [index, isInView, onViewChange]);
  return (
    <div
      ref={ref}
      className={`py-8 lg:py-0 lg:h-[calc(100vh-120px)] ${isLastSection ? 'lg:mb-60' : ''} `}
    >
      <div className='h-full max-w-[720px] m-auto flex-col gap-6 lg:gap-10 justify-center flex px-4 lg:px-0'>
        <div className='flex-col gap-4.5 justify-center flex'>
          <HeadingText type='h2'>{heading}</HeadingText>
          <ParagraphText className='hidden md:block'>
            {description}
          </ParagraphText>
        </div>
        <div className='w-full'>
          <DropdownSelect
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(d: any) => {
              setActiveButton(d);
              onClick(d.value);
            }}
            value={activeButton}
            options={buttons}
            size='base'
            variant='normal'
            className='poppins-regular border-0! rounded-[8px]! w-full'
            classNames={DROPDOWN_CLASSNAMES}
            components={customDropdownComponents('light', false)}
          />
        </div>
        <Link
          to='/main-indicators/{-$indicator}'
          params={{ indicator: heading.replaceAll(' ', '-').toLowerCase() }}
        >
          <Button variant='tertiary'>View more →</Button>
        </Link>
      </div>
    </div>
  );
};

export default GlobeControls;
