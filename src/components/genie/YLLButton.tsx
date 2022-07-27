import { useState } from 'react';

import LightningIcon from '@/icons/LightningIcon';
import Button from '../Button';
import BookingPanel from './BookingPanel';

type Props = {
  onOpen?: (elem: React.ReactElement) => void;
  onClose?: () => void;
} & Omit<Parameters<typeof Button>[0], 'onClick' | 'title'>;

export default function YLLButton({ onOpen, onClose, ...props }: Props) {
  const [panel, setPanel] = useState<React.ReactElement>();
  const open = onOpen || setPanel;
  const close = onClose || (() => setPanel(undefined));
  return (
    <>
      <Button
        {...props}
        onClick={() => open(<BookingPanel onClose={close} />)}
        title="Your Lightning Lanes"
      >
        <LightningIcon />
      </Button>
      {panel}
    </>
  );
}
