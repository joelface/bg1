import { Guest, Queue } from '@/api/vq';
import FloatingButton from '@/components/FloatingButton';
import GuestList from '@/components/GuestList';
import Screen from '@/components/Screen';
import { useNav } from '@/contexts/Nav';
import { useVQClient } from '@/contexts/VQClient';
import useDataLoader from '@/hooks/useDataLoader';
import { ping } from '@/ping';

import StartTime from '../StartTime';
import BGResult from './BGResult';

export default function JoinQueue({
  queue,
  guests,
}: {
  queue: Queue;
  guests: Guest[];
}) {
  const { goTo } = useNav();
  const client = useVQClient();
  const { loadData, loaderElem } = useDataLoader();

  async function joinQueue() {
    await loadData(
      async flash => {
        if (!queue || !(await client.getQueue(queue)).isAcceptingJoins) {
          flash('Queue not open yet');
          return;
        }
        const result = await client.joinQueue(queue, guests);
        goTo(<BGResult queue={queue} guests={guests} result={result} />, {
          replace: true,
        });
        if (result.boardingGroup !== null) ping();
      },
      { minLoadTime: 999 }
    );
  }

  return (
    <Screen heading="Join Virtual Queue">
      <h2>{queue.name}</h2>
      <StartTime queue={queue} screen={JoinQueue} />
      <h3>Your Party</h3>
      <GuestList guests={guests} />
      <FloatingButton onClick={joinQueue}>Join Virtual Queue</FloatingButton>
      {loaderElem}
    </Screen>
  );
}
