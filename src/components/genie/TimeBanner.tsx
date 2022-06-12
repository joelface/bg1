import { useTheme } from '/contexts/Theme';
import { displayTime } from '/datetime';

export default function TimeBanner({
  label,
  time,
}: {
  label: string;
  time: string;
}) {
  const theme = useTheme();
  return (
    <div
      className={`-mx-3 px-3 pb-1 ${theme.bg} text-white text-sm font-semibold uppercase text-center`}
    >
      {label}: <time>{displayTime(time)}</time>
    </div>
  );
}
