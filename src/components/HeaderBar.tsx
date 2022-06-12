import { useTheme } from '/contexts/Theme';

export default function HeaderBar({
  title,
  children,
}: {
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { bg } = useTheme();
  return (
    <div
      className={`flex justify-end gap-x-2 gap-y-1 min-h-[52px] px-3 py-2 font-semibold text-white ${bg}`}
    >
      <h1 className="flex-1 self-center py-0.5 text-xl overflow-hidden whitespace-nowrap">
        {title}
      </h1>
      {children}
    </div>
  );
}
