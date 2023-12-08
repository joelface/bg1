import { PlusExperience } from '@/api/genie';
import Button from '@/components/Button';
import { useNav } from '@/contexts/Nav';
import { displayTime } from '@/datetime';

import BookExperience from '../BookExperience';
import LabeledItem from './LabeledItem';

export default function GeniePlusButton({
  experience,
}: {
  experience: PlusExperience;
}) {
  const { goTo } = useNav();
  const { flex } = experience;

  return (
    <LabeledItem label="Genie+">
      <span>
        <Button
          onClick={() => goTo(<BookExperience experience={experience} />)}
        >
          {flex.nextAvailableTime
            ? displayTime(flex.nextAvailableTime)
            : 'none'}
        </Button>
      </span>
    </LabeledItem>
  );
}
