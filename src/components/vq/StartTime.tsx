import { Queue } from '@/api/vq';
import { useScreens } from '@/contexts/Nav';

import TimeBoard from '../TimeBoard';

export default function StartTime({
  queue,
  screen,
}: {
  queue: Queue;
  screen: React.FC<any>;
}) {
  const { current } = useScreens();
  return queue.isAcceptingJoins || current.type !== screen ? null : (
    <TimeBoard time={queue.nextScheduledOpenTime} label="Next queue opening" />
  );
}
