import Button from '@/components/Button';

export default function Legend({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 flex justify-center">
      <div>
        <h2 className="mt-0 pl-1 text-gray-500 text-sm leading-tight uppercase">
          Symbols
        </h2>
        <div className="border-2 border-gray-500 rounded px-2 py-0.5 bg-gray-100">
          <table>
            <tbody>{children}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function Symbol({
  sym,
  def,
  onInfo,
}: {
  sym: React.ReactNode;
  def: React.ReactNode;
  onInfo?: () => void;
}) {
  return (
    <tr>
      <th className="py-0.5 text-center font-bold">{sym}</th>
      <td className="pl-3 py-0.5">{def}</td>
      {onInfo && (
        <td className="pl-3 py-0.5">
          <Button type="small" onClick={onInfo}>
            Info
          </Button>
        </td>
      )}
    </tr>
  );
}
