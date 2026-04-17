import { Spacer } from '@undp/design-system-react/Spacer';

import { HeadingText, ParagraphText } from '@/Components/Typography';

function AboutUsPage() {
  return (
    <div className='relative container mx-auto px-4 lg:px-0'>
      <Spacer size='7xl' />
      <HeadingText type='h2'>
        About the Global Corruption Measurement Digital Dashboard
      </HeadingText>
      <Spacer size='xl' />
      <ParagraphText>
        UNDP’s Global Corruption Measurement Data Dashboard is a central
        repository that brings together anti-corruption indicators and
        methodologies to provide reliable data to inform dialogue, support
        collaboration, and guide evidence-based policymaking
        <br />
        <br />
        Our approach respects national contexts and ownership, and is grounded
        in partnership, aligning with countries’ own development priorities and
        institutional realities. The Global Corruption Measurement Data
        Dashboard is designed to be adaptive, supportive, and non-punitive;
        focussing on learning, capacity-building, and progress over time.
      </ParagraphText>
      <Spacer size='6xl' />
      <HeadingText type='h2'>
        About the Global Initiative on Corruption Measurement
      </HeadingText>
      <Spacer size='xl' />
      <div className='flex gap-6 lg:gap-10 items-center flex-wrap'>
        <div className='w-full lg:w-[calc(60%-20px)] shrink-0'>
          <ParagraphText>
            The Global Initiative for Measuring Corruption is part of UNDP’s
            Global Anti-Corruption Programme, which serves as the organization’s
            main platform for providing policy and programmatic support on
            anti-corruption.
            <br />
            <br />
            The Global Initiative on Measuring Corruption, led by UNDP alongside
            UNODC and IACA, and supported by Nazaha (Saudi Arabia's Oversight
            and Anti-Corruption Authority), is spearheading efforts for
            corruption measurement across different sectors by developing new
            evidence-based methodologies and tools for measuring corruption that
            can be used to assess countries’ performance and progress in
            combating corruption.
            <br />
            <br />
            Measuring corruption is critical to understanding its drivers,
            impacts, and trends – and to designing effective responses. By
            developing reliable, comparable indicators and actionable data, we
            can strengthen transparency, accountability, and evidence-based
            policymaking in the fight against corruption.
            <br />
            <br />
            Through initiatives such as the Global Initiative on Measuring
            Corruption and the development of innovative data-driven tools such
            as this dashboard, UNDP is setting international standards, shaping
            policy agendas, and supporting countries to move from fragmented
            efforts to coordinated, evidence-based action against corruption.
            <br />
            <br />
            Find out more on{' '}
            <a
              className='underline poppins-semibold'
              href='https://info.anti-corruption.org/'
              target='_blank'
            >
              UNDP Anti-Corruption Web Portal
            </a>
            .
          </ParagraphText>
        </div>
        <div className='w-full lg:w-[calc(40%-20px)]'>
          <img
            src='/imgs/GlobalInitiativeLogo.png'
            alt='Logo'
            className='inset-0 w-full h-full object-cover'
          />
        </div>
      </div>
    </div>
  );
}

export default AboutUsPage;
