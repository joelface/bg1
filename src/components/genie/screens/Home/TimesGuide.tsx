import { Land } from '@/api/data';
import { Experience } from '@/api/genie';
import Screen from '@/components/Screen';
import Tab from '@/components/Tab';
import { useExperiences } from '@/contexts/Experiences';
import { useNav } from '@/contexts/Nav';

import { HomeTabProps } from '../Home';
import RefreshButton from '../RefreshButton';
import Legend, { Symbol } from './Legend';
import ParkSelect from './ParkSelect';

export default function TimesGuide({ contentRef }: HomeTabProps) {
  const { goTo } = useNav();
  const { experiences, refreshExperiences, loaderElem } = useExperiences();
  const showExpInfo = (exp: Experience) => goTo(<ExperienceInfo exp={exp} />);

  const expsByLand = new Map<Land, Record<Experience['type'], Experience[]>>();
  experiences
    .filter(
      exp =>
        exp.standby.available ||
        exp.standby.unavailableReason === 'TEMPORARILY_DOWN'
    )
    .sort(
      (a, b) =>
        a.land.sort - b.land.sort ||
        (a.sort || Infinity) - (b.sort || Infinity) ||
        a.name.localeCompare(b.name)
    )
    .forEach(exp => {
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
    <Tab
      heading="Times Guide"
      buttons={
        <>
          <ParkSelect />
          <RefreshButton name="Times" onClick={refreshExperiences} />
        </>
      }
      contentRef={contentRef}
    >
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
      {experiences.length > 0 && (
        <Legend>
          <Symbol sym="*" def="No listed wait/show time" />
          <Symbol sym="❌" def="Temporarily down" />
        </Legend>
      )}
      {loaderElem}
    </Tab>
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

const ExperienceInfo = ({ exp }: { exp: Experience }) => (
  <Screen heading="Experience Info">
    <h2>{exp.name}</h2>
    <div>{exp.park.name}</div>
    <h3>Upcoming {exp.type === 'CHARACTER' ? 'Appearances' : 'Shows'}</h3>
    <ul className="list-disc mt-2 pl-6">
      {!!exp.standby.displayNextShowTime && (
        <li>{exp.standby.displayNextShowTime}</li>
      )}
      {exp.displayAdditionalShowTimes?.map(time => (
        <li key={time}>{time}</li>
      ))}
    </ul>
  </Screen>
);
