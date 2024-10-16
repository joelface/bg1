import { FlexExperience } from '@/api/ll';
import Button from '@/components/Button';
import { useNav } from '@/contexts/Nav';
import { displayTime } from '@/datetime';

import BookExperience from '../BookExperience';
import LabeledItem from './LabeledItem';

export default function LLButton({
  experience,
}: {
  experience: FlexExperience;
}) {
  const { goTo } = useNav();
  const { flex } = experience;

  return (
    <LabeledItem label="LL">
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
