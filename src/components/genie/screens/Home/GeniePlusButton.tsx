import { PlusExperience } from '@/api/genie';
import { displayTime } from '@/datetime';
import Button from '@/components/Button';
import LabeledItem from './LabeledItem';

export default function GeniePlusButton({
  experience,
  onClick,
}: {
  experience: PlusExperience;
  onClick: (experience: PlusExperience) => void;
}) {
  const { flex } = experience;

  return (
    <LabeledItem label="Genie+">
      <span>
        <Button onClick={() => onClick(experience)}>
          {flex.nextAvailableTime
            ? displayTime(flex.nextAvailableTime)
            : 'none'}
        </Button>
      </span>
    </LabeledItem>
  );
}
