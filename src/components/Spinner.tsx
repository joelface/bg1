import { useTheme } from '@/contexts/Theme';
import RefreshIcon from '@/icons/RefreshIcon';

import Overlay from './Overlay';

export default function Spinner() {
  const { bg } = useTheme();
  return (
    <Overlay color="bg-white">
      <div className="w-[50px] mx-auto">
        <div aria-label="Loading…" className={`rounded-full p-[20%] ${bg}`}>
          <RefreshIcon className="animate-spin w-full text-white" />
        </div>
      </div>
    </Overlay>
  );
}
