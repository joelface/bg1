import { DasBooking } from '@/api/genie';
import { usePlans } from '@/contexts/Plans';
import { useTheme } from '@/contexts/Theme';

import { Time } from '../Time';

export default function DasHeader() {
  const { plans } = usePlans();
  const theme = useTheme();
  const selection = plans.find(
    (b): b is DasBooking => b.type === 'DAS' && b.subtype === 'IN_PARK'
  );
  if (!selection) return null;

  return (
    <div className={`-mx-3 pb-1 ${theme.bg}`}>
      <div
        className={`pb-1 ${theme.bg} text-white text-sm font-semibold uppercase text-center`}
      >
        DAS Selection
      </div>
      <div className="px-3 py-2 bg-white bg-opacity-90">
        <ul>
          <li className="flex items-center">
            <span className="text-lg leading-snug font-semibold truncate">
              Meet Cinderella (Princess Fairytale Hall)
            </span>{' '}
            <Time
              time={selection.start.time}
              className="ml-2 text-gray-500 font-semibold whitespace-nowrap"
            />
          </li>
        </ul>
      </div>
    </div>
  );
}
