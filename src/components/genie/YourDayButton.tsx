import { useNav } from '@/contexts/Nav';
import ClockIcon from '@/icons/ClockIcon';

import Button from '../Button';
import YourDay from './screens/YourDay';

type Props = Omit<Parameters<typeof Button>[0], 'onClick' | 'title'>;

export default function YourDayButton({ ...props }: Props) {
  const { goTo } = useNav();
  return (
    <>
      <Button {...props} onClick={() => goTo(<YourDay />)} title="Your Day">
        <ClockIcon />
      </Button>
    </>
  );
}
