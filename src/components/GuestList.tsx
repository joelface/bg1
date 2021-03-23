import { h } from 'preact';

import { Guest } from '../virtual-queue';

interface GuestListProps {
  guests: Guest[];
  selectable?: {
    isSelected: (guest: Guest) => boolean;
    onToggle: (guest: Guest) => void;
  };
}

export default function GuestList({
  guests,
  selectable,
}: GuestListProps): h.JSX.Element {
  return (
    <ul className="mt-3 ml-3">
      {guests.map(g => (
        <li key={g.guestId} className="py-1.5">
          <label>
            {selectable ? (
              <input
                type="checkbox"
                checked={selectable.isSelected(g)}
                onChange={() => selectable.onToggle(g)}
                className="rounded mr-4 p-2.5 text-green-500"
              />
            ) : (
              ''
            )}
            <img
              src={g.avatarImageUrl}
              alt=""
              width="56"
              height="56"
              className="inline rounded-full mr-3"
            />
            <span>
              {g.firstName} {g.lastName}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
