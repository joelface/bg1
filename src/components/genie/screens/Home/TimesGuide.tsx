import { Land } from '@/api/genie';
import { useModal } from '@/contexts/Modal';
import Modal from '@/components/Modal';
import Legend, { Symbol } from './Legend';
import { Experience, ScreenProps } from '../Home';

export default function TimesGuide({ experiences }: ScreenProps) {
  const modal = useModal();
  const showExpInfo = (exp: Experience) =>
    modal.show(<ExperienceInfoModal exp={exp} />);

  const expsByLand = new Map<Land, Record<Experience['type'], Experience[]>>();
  experiences.forEach(exp => {
    if (!expsByLand.has(exp.land)) {
      expsByLand.set(exp.land, {
        ATTRACTION: [],
        ENTERTAINMENT: [],
        CHARACTER: [],
      });
    }
    expsByLand.get(exp.land)?.[exp.type]?.push(exp);
  });

  return (
    <>
      {[...expsByLand].map(([land, expsByType]) => (
        <div key={land.name}>
          <h2
            className={`pr-1 ${land.theme.text} text-sm font-semibold text-right uppercase`}
          >
            {land.name}
          </h2>
          <div className="rounded overflow-hidden">
            <ExperienceList
              title="Attractions"
              land={land}
              experiences={expsByType.ATTRACTION}
              onInfoClick={showExpInfo}
            />
            <ExperienceList
              title="Entertainment"
              land={land}
              experiences={expsByType.ENTERTAINMENT}
              onInfoClick={showExpInfo}
            />
            <ExperienceList
              title="Characters"
              land={land}
              experiences={expsByType.CHARACTER}
              onInfoClick={showExpInfo}
            />
          </div>
        </div>
      ))}
      <Legend>
        <Symbol sym="*" def="No listed wait/show time" />
        <Symbol sym="❌" def="Temporarily down" />
      </Legend>
    </>
  );
}

function ExperienceList({
  title,
  land,
  experiences,
  onInfoClick,
}: {
  title: string;
  land: Land;
  experiences: Experience[];
  onInfoClick: (experience: Experience) => void;
}) {
  if (experiences.length === 0) return null;
  return (
    <div className={`${land.theme.bg}`} data-testid={`${land.name}-${title}`}>
      <h3 className="mt-0 py-1 text-white text-xs font-semibold text-center uppercase">
        {title}
      </h3>
      <table className="w-full bg-white bg-opacity-90 leading-snug">
        <tbody>
          {experiences.map(exp => (
            <tr className="group" key={exp.id}>
              <td
                className={`${
                  exp.standby.displayNextShowTime
                    ? 'min-w-[5.625rem]'
                    : 'min-w-[2.75rem]'
                } px-2 py-0.5 group-first:pt-1 group-last:pb-1 ${
                  land.theme.bg
                } bg-opacity-10 ${
                  land.theme.text
                } font-bold text-center uppercase whitespace-nowrap`}
              >
                {exp.standby.displayNextShowTime ? (
                  (exp.displayAdditionalShowTimes?.length ?? 0) > 0 ? (
                    <button
                      onClick={() => onInfoClick(exp)}
                      className="underline"
                    >
                      {exp.standby.displayNextShowTime}
                    </button>
                  ) : (
                    exp.standby.displayNextShowTime
                  )
                ) : exp.standby.available ? (
                  exp.standby.waitTime ?? '*'
                ) : (
                  '❌'
                )}
              </td>
              <td className="w-full px-1 pl-2 py-0.5 group-first:pt-1 group-last:pb-1">
                {exp.name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const ExperienceInfoModal = ({ exp }: { exp: Experience }) => (
  <Modal heading={exp.name}>
    <h3 className="w-[75vw] mt-2 text-gray-500 text-sm font-semibold uppercase">
      Upcoming {exp.type === 'CHARACTER' ? 'Appearances' : 'Shows'}
    </h3>
    <ul className="list-disc mt-2 pl-6">
      {!!exp.standby.displayNextShowTime && (
        <li>{exp.standby.displayNextShowTime}</li>
      )}
      {exp.displayAdditionalShowTimes?.map(time => (
        <li key={time}>{time}</li>
      ))}
    </ul>
  </Modal>
);
