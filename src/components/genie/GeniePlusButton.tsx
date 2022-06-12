import { PlusExperience } from '/api/genie';
import { displayTime } from '/datetime';
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
      {flex.nextAvailableTime ? (
        <span>
          <Button onClick={() => onClick(experience)}>
            {displayTime(flex.nextAvailableTime)}
          </Button>
        </span>
      ) : (
        <span className="inline-block border-2 border-gray-500 rounded px-1.5 py-0.5 font-semibold text-gray-500 bg-gray-100">
          none
        </span>
      )}
    </LabelledItem>
  );
}
