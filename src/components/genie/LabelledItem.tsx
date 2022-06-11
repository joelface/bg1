export default function LabelledItem({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center flex-1 whitespace-nowrap">
      <span className="mr-2 text-xs font-semibold uppercase text-gray-500">
        {label}
      </span>{' '}
      {children}
    </div>
  );
}
