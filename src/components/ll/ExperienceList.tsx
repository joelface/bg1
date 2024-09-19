import { Experience } from '@/api/ll';

export function ExperienceList({
  bg,
  experiences,
  heading,
}: {
  bg: string;
  experiences: Pick<Experience, 'id' | 'name'>[];
  heading: React.ReactNode;
}) {
  return (
    <div className={`mt-4 rounded ${bg}`}>
      <h3 className="mt-0 p-1 text-white text-center">{heading}</h3>
      <ul className="list-disc py-2 pl-8 bg-white bg-opacity-90">
        {experiences.map(exp => (
          <li key={exp.id}>{exp.name}</li>
        ))}
      </ul>
    </div>
  );
}
