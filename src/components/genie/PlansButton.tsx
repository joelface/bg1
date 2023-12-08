import { useNav } from '@/contexts/Nav';
import CalendarIcon from '@/icons/CalendarIcon';

import Button from '../Button';
import Plans from './screens/Plans';

type Props = Omit<Parameters<typeof Button>[0], 'onClick' | 'title'>;

export default function PlansButton({ ...props }: Props) {
  const { goTo } = useNav();
  return (
    <>
      <Button {...props} onClick={() => goTo(<Plans />)} title="Plans">
        <CalendarIcon />
      </Button>
    </>
  );
}
