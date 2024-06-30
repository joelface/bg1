import { Experience } from '@/api/genie';
import { displayTime } from '@/datetime';

import LabeledItem from './LabeledItem';

export default function StandbyTime({
  experience: { type, standby, virtualQueue },
}: {
  experience: Pick<Experience, 'type' | 'standby' | 'virtualQueue'>;
}) {
  return standby.nextShowTime ||
    (type === 'ENTERTAINMENT' && !standby.waitTime) ? (
    <NextShowTime standby={standby} />
  ) : virtualQueue ? (
    <VQStatus virtualQueue={virtualQueue} />
  ) : (
    <WaitTime standby={standby} />
  );
}

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

const Available = ({ time }: { time: string }) => (
  <span className={`${className} border-gray-500 text-gray-500 bg-gray-100`}>
    {time}
  </span>
);

const Unavailable = ({ text }: { text: string }) => (
  <span className={`${className} border-red-600 text-red-600 bg-red-100`}>
    {text}
  </span>
);
