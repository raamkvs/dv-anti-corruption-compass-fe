import { Printer } from 'lucide-react';

import { Button } from '@/Components/Button';

interface Props {
  label?: string;
}

export function PrintButton({ label = 'Download as PDF' }: Props) {
  return (
    <Button
      variant='secondary'
      className='print:hidden w-fit flex items-center gap-2'
      onClick={() => window.print()}
    >
      <Printer size={16} strokeWidth={2.5} />
      {label}
    </Button>
  );
}
