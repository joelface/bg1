import { Guest, Queue } from '@/api/vq';
import FloatingButton from '@/components/FloatingButton';
import GuestList from '@/components/GuestList';
import TimeBoard from '@/components/TimeBoard';
import { useNav } from '@/contexts/Nav';
import { useResortData } from '@/contexts/ResortData';
import { useVQClient } from '@/contexts/VQClient';
import useDataLoader from '@/hooks/useDataLoader';
import { ping } from '@/ping';

import BGResult from './BGResult';
import QueueScreen from './QueueScreen';

export default function JoinQueue({
  queue,
  guests,
}: {
  queue: Queue;
  guests: Guest[];
}) {
  const { goTo } = useNav();
  const { resort } = useResortData();
  const client = useVQClient();
  const { loadData, loaderElem } = useDataLoader();

  async function joinQueue() {
    await loadData(
      async flash => {
        const q = await client.getQueue(queue);
        if (!q.isAcceptingJoins) {
          return flash(
            q.isAcceptingPartyCreation
              ? 'Queue not open yet'
              : 'No boarding groups available'
          );
        }
        const result = await client.joinQueue(queue, guests);
        goTo(<BGResult queue={queue} guests={guests} result={result} />, {
          replace: true,
        });
        if (result.boardingGroup !== null) ping(resort, 'V');
      },
      { minLoadTime: 999 }
    );
  }

  return (
    <QueueScreen queue={queue} heading="Virtual Queue">
      {!queue.isAcceptingJoins && (
        <TimeBoard
          time={queue.nextScheduledOpenTime}
          label="Next queue opening"
        />
      )}
      {!queue.isAcceptingJoins && queue.nextScheduledOpenTime !== null && (
        <p>
          Tap the <b>Join Virtual Queue</b> button when the clock reads{' '}
          <time className="font-semibold">{queue.nextScheduledOpenTime}</time>.
          The queue can fill up almost instantly, so be quick!
        </p>
      )}
      <h3>Your Party</h3>
      <GuestList guests={guests} />
      <FloatingButton onClick={joinQueue}>Join Virtual Queue</FloatingButton>
      {loaderElem}
    </QueueScreen>
  );
}
