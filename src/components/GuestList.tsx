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
  };
  conflicts?: InfoById;
}) {
  if (guests.length === 0) return null;

  return (
    <ul className="mt-2">
      {guests.map(g => {
        return (
          <li key={g.id} className="px-3 py-1">
            <label className="flex items-center">
              {selectable ? (
                <input
                  type="checkbox"
                  checked={selectable.isSelected(g)}
                  onChange={() => selectable.onToggle(g)}
                  className="mr-3"
                />
              ) : null}
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
                <br />
                {conflicts?.[g.id] ? (
                  <span className="text-xs font-semibold text-red-700 uppercase">
                    {conflicts[g.id]?.replace(/_/g, ' ')}
                  </span>
                ) : null}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
