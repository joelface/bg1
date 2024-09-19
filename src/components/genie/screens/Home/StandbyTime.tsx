import { Experience } from '@/api/genie';
import { displayTime } from '@/datetime';

import LabeledItem from './LabeledItem';

export default function StandbyTime({
  experience: { type, standby, virtualQueue, avgWait },
  average,
}: {
  experience: Pick<Experience, 'type' | 'standby' | 'virtualQueue' | 'avgWait'>;
  average?: boolean;
}) {
  return average ? (
    <AverageWait time={avgWait} virtualQueue={virtualQueue} />
  ) : standby.nextShowTime ||
    (type === 'ENTERTAINMENT' && !standby.waitTime) ? (
    <NextShowTime standby={standby} />
  ) : virtualQueue ? (
    <VQStatus virtualQueue={virtualQueue} />
  ) : (
    <WaitTime standby={standby} />
  );
}

const AverageWait = ({
  time,
  virtualQueue,
}: {
  time?: number;
  virtualQueue?: Experience['virtualQueue'];
}) => (
  <LabeledItem label="Standby">
    <Available
      time={
        time !== undefined ? (
          <>{Math.round(time / 5) * 5} min</>
        ) : virtualQueue ? (
          <abbr title="Virtual queue">VQ</abbr>
        ) : (
          <abbr title="Not applicable" className="px-1">
            *
          </abbr>
        )
      }
    />
  </LabeledItem>
);

const WaitTime = ({ standby }: Pick<Experience, 'standby'>) => (
  <LabeledItem label="Standby">
    {standby.available ? (
      <Available
        time={
          standby.waitTime !== undefined ? standby.waitTime + ' min' : 'now'
        }
      />
    ) : (
      <Unavailable text="down" />
    )}
  </LabeledItem>
);

const NextShowTime = ({ standby }: Pick<Experience, 'standby'>) => (
  <LabeledItem
    label={
      <>
        Next <span className="hidden xs:inline">Show</span>
      </>
    }
  >
    {standby.nextShowTime ? (
      <Available time={displayTime(standby.nextShowTime)} />
    ) : (
      <Unavailable text="none" />
    )}
  </LabeledItem>
);

const VQStatus = ({
  virtualQueue,
}: Required<Pick<Experience, 'virtualQueue'>>) => (
  <LabeledItem label={<abbr title="Virtual Queue">VQ</abbr>}>
    <Available
      time={
        virtualQueue.nextAvailableTime
          ? displayTime(virtualQueue.nextAvailableTime)
          : 'closed'
      }
    />
  </LabeledItem>
);

const className = 'inline-block border-2 rounded px-1.5 py-0.5 font-semibold';

const Available = ({ time }: { time: React.ReactNode }) => (
  <span className={`${className} border-gray-500 text-gray-500 bg-gray-100`}>
    {time}
  </span>
);

const Unavailable = ({ text }: { text: React.ReactNode }) => (
  <span className={`${className} border-red-600 text-red-600 bg-red-100`}>
    {text}
  </span>
);
