import { h } from 'preact';

import { Guest } from '../virtual-queue';

export default function GuestList({
  guests,
  selectable,
}: {
  guests: Guest[];
  selectable?: {
    isSelected: (i: number) => boolean;
    onToggle: (i: number) => void;
  };
}): h.JSX.Element {
  return (
    <ul className="mt-3 ml-3">
      {guests.map((g, i) => (
        <li key={g.guestId} className="py-1.5">
          <label>
            {selectable ? (
              <input
                type="checkbox"
                checked={selectable.isSelected(i)}
                onChange={() => selectable.onToggle(i)}
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
