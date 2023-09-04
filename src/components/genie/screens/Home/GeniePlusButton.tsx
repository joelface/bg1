import { PlusExperience } from '@/api/genie';
import { displayTime } from '@/datetime';

import LabeledItem from './LabeledItem';

export default function GeniePlusButton({
  experience,
}: {
  experience: PlusExperience;
}) {
  const { flex } = experience;

  return (
    <LabeledItem label="Genie+">
      <span
        className={`inline-block border-2 rounded px-1.5 py-0.5 font-semibold ${
          flex.nextAvailableTime
            ? `border-gray-500 text-gray-500 bg-gray-100`
            : `border-red-600 text-red-600 bg-red-100`
        }`}
      >
        {flex.nextAvailableTime ? displayTime(flex.nextAvailableTime) : 'none'}
      </span>
    </LabeledItem>
  );
}
