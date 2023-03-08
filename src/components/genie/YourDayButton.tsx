import { useState } from 'react';

import ClockIcon from '@/icons/ClockIcon';

import Button from '../Button';
import YourDay from './screens/YourDay';

type Props = {
  onOpen?: (elem: React.ReactElement) => void;
  onClose?: () => void;
} & Omit<Parameters<typeof Button>[0], 'onClick' | 'title'>;

export default function YourDayButton({ onOpen, onClose, ...props }: Props) {
  const [panel, setPanel] = useState<React.ReactElement>();
  const open = onOpen || setPanel;
  const close = onClose || (() => setPanel(undefined));
  return (
    <>
      <Button
        {...props}
        onClick={() => open(<YourDay onClose={close} />)}
        title="Your Day"
      >
        <ClockIcon />
      </Button>
      {panel}
    </>
  );
}
