import { Spacer } from '@undp/design-system-react/Spacer';

import { Card } from '@/Components/Card';
import { HeadingText, ParagraphText } from '@/Components/Typography';

interface Props {
  title: string;
  imgSrc: string;
  description: string;
  onClick?: () => void;
}

function CountryProfileCard({ description, title, imgSrc, onClick }: Props) {
  return (
    <Card
      className='pr-4 lg:pr-16 pl-4 lg:pl-6 py-6 lg:py-8 cursor-pointer'
      onClick={onClick}
    >
      <img src={imgSrc} className='w-[80px] h-[80px]' alt='icons' />
      <Spacer size='2xl' />
      <HeadingText type='h3'>{title}</HeadingText>
      <Spacer size='xl' />
      <ParagraphText weight='light'>{description}</ParagraphText>
      <Spacer size='2xl' />
      <ParagraphText weight='semibold'>View More →</ParagraphText>
    </Card>
  );
}

export { CountryProfileCard };
