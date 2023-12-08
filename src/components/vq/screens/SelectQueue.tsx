import { useCallback, useEffect, useState } from 'react';

import { Queue } from '@/api/vq';
import Button from '@/components/Button';
import Screen from '@/components/Screen';
import { useNav } from '@/contexts/Nav';
import { useTheme } from '@/contexts/Theme';
import { useVQClient } from '@/contexts/VQClient';
import { displayTime } from '@/datetime';
import useDataLoader from '@/hooks/useDataLoader';
import RefreshIcon from '@/icons/RefreshIcon';
import onVisible from '@/onVisible';

import ChooseParty from './ChooseParty';

const isAttraction = (queue: Queue) => queue.categoryContentId === 'attraction';
const isActive = (queue: Queue) =>
  queue.isAcceptingPartyCreation || queue.isAcceptingJoins;

export default function SelectQueue() {
  const client = useVQClient();
  const { goTo, goBack } = useNav();
  const theme = useTheme();
  const { loadData, loaderElem } = useDataLoader();
  const [queues, setQueues] = useState<Queue[]>([]);
  const [queuesLoaded, setQueuesLoaded] = useState(false);
  const [, setSelectedQueue] = useState<Queue>();

  const refreshQueues = useCallback(() => {
    loadData(async () => {
      const queues = await client.getQueues();
      queues.sort(
        (a, b) =>
          +isActive(b) - +isActive(a) || +isAttraction(b) - +isAttraction(a)
      );
      setQueues(queues);
      setSelectedQueue(queue => {
        if (!queue) return queue;
        const q = queues.find(q => q.id === queue.id);
        if (q && isActive(q)) return queue;
        setSelectedQueue(undefined);
        goBack({ screen: SelectQueue });
      });
      setQueuesLoaded(true);
    });
  }, [client, goBack, loadData]);

  useEffect(() => {
    refreshQueues();
    return onVisible(refreshQueues);
  }, [refreshQueues]);

  return (
    <Screen
      heading="Virtual Queues"
      buttons={
        <Button title="Refresh Queues" onClick={refreshQueues}>
          <RefreshIcon />
        </Button>
      }
      footer={
        <div className="p-2 text-right">
          <Button
            className={`bg-opacity-90 bg-white ${theme.text}`}
            onClick={() => client.logOut()}
          >
            Log Out
          </Button>
        </div>
      }
    >
      {queues.length > 0 ? (
        <ul className="mt-1">
          {queues.map(q => (
            <li
              key={q.id}
              className="py-3 first:border-0 border-t-4 border-gray-300"
            >
              <h2 className="mt-0">{q.name}</h2>
              <div className="flex items-center mt-2">
                <div className="flex-1">
                  {q.isAcceptingJoins ? (
                    <span>Available now</span>
                  ) : q.nextScheduledOpenTime ? (
                    <>
                      Next opening:{' '}
                      <time
                        dateTime={q.nextScheduledOpenTime}
                        className="font-semibold"
                      >
                        {displayTime(q.nextScheduledOpenTime)}
                      </time>
                    </>
                  ) : (
                    'No more openings today'
                  )}
                </div>
                <div className="pl-3">
                  <Button
                    disabled={!isActive(q)}
                    onClick={() => {
                      setSelectedQueue(q);
                      goTo(<ChooseParty queue={q} />);
                    }}
                  >
                    {isActive(q) ? 'Join Queue' : 'Closed'}
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : queuesLoaded && !loaderElem ? (
        <p className="text-gray-500 font-semibold text-center uppercase">
          No virtual queues found
        </p>
      ) : null}
      {loaderElem}
    </Screen>
  );
}
