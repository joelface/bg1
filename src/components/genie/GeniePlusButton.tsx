import { PlusExperience } from '@/api/genie';
import { displayTime } from '@/datetime';
import Button from '../Button';
import LabelledItem from './LabelledItem';

export default function GeniePlusButton({
  experience,
  onClick,
}: {
  experience: PlusExperience;
  onClick: (experience: PlusExperience) => void;
}) {
  const { flex } = experience;

  return (
    <LabelledItem label="Genie+">
      <span>
        <Button onClick={() => onClick(experience)}>
          {flex.nextAvailableTime
            ? displayTime(flex.nextAvailableTime)
            : 'none'}
        </Button>
      </span>
    </LabelledItem>
  );
}
