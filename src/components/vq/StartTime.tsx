import { Queue } from '@/api/vq';
import { useScreens } from '@/contexts/Nav';
import { useVQClient } from '@/contexts/VQClient';

import TimeBoard from '../TimeBoard';

export default function StartTime({
  queue,
  screen,
}: {
  queue: Queue;
  screen: React.FC<any>;
}) {
  const { current } = useScreens();
  const { resort } = useVQClient();
  return queue.isAcceptingJoins || current.type !== screen ? null : (
    <TimeBoard
      resort={resort}
      time={queue.nextScheduledOpenTime}
      label="Next queue opening"
    />
  );
}
