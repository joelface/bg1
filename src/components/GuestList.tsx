import useFlash from '@/hooks/useFlash';

export interface Guest {
  id: string;
  name: string;
  avatarImageUrl?: string;
}

export interface InfoById {
  [id: string]: string | undefined;
}

export default function GuestList<T extends Guest>({
  guests,
  selectable,
  conflicts,
}: {
  guests: T[];
  selectable?: {
    isSelected: (guest: T) => boolean;
    onToggle: (guest: T) => void;
    limit?: number;
  };
  conflicts?: InfoById;
}) {
  const [flashElem, flash] = useFlash();

  if (guests.length === 0) return null;

  const selected = new Set(
    selectable ? guests.filter(selectable?.isSelected) : []
  );
  const limitReached = selected.size >= (selectable?.limit ?? Infinity);

  return (
    <>
      <ul className="mt-2">
        {guests.map(g => {
          const checked = selected.has(g);
          const disabled = limitReached && !checked;
          return (
            <li
              key={g.id}
              className="px-3 py-1"
              onClick={() => flash(disabled ? 'Selection limit reached' : '')}
            >
              <label className="flex items-center">
                {selectable && (
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => selectable.onToggle(g)}
                    className="mr-3"
                  />
                )}
                <span className="w-[48px] h-[48px] leading-[48px] mr-3 rounded-full text-3xl font-bold text-center bg-gray-400 text-white">
                  {g.avatarImageUrl ? (
                    <img
                      src={g.avatarImageUrl}
                      alt=""
                      width="48"
                      height="48"
                      className="rounded-full"
                    />
                  ) : (
                    <span aria-hidden="true">{g.name[0]}</span>
                  )}
                </span>
                <span className="leading-tight">
                  {g.name}
                  {conflicts?.[g.id] && (
                    <span className="block text-xs font-semibold text-red-700 uppercase">
                      {conflicts[g.id]?.replace(/_/g, ' ')}
                    </span>
                  )}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {flashElem}
    </>
  );
}
