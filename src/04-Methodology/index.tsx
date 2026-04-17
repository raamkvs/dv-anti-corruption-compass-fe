import { Spacer } from '@undp/design-system-react/Spacer';

import { HeadingText } from '@/Components/Typography';
import PublicProcurementMethodology from '@/Components/MethodologyBlocks/PublicProcurementMethodology';
import EnterpriseSurveyMethodology from '@/Components/MethodologyBlocks/EnterpriseSurveyMethodology';

function MethodologyPage() {
  return (
    <div className='relative container mx-auto px-4 lg:px-0'>
      <Spacer size='7xl' />
      <HeadingText type='h2'>Methodology</HeadingText>
      <Spacer size='4xl' />
      <HeadingText type='h3'>Public Procurement</HeadingText>
      <Spacer size='xl' />
      <PublicProcurementMethodology />
      <Spacer size='4xl' />
      <HeadingText type='h3'>World Bank's Enterprise Survey</HeadingText>
      <Spacer size='xl' />
      <EnterpriseSurveyMethodology />
    </div>
  );
}

export default MethodologyPage;
