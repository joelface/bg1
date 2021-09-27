import { h } from 'preact';

import { Guest, JoinQueueConflicts } from '../virtual-queue';

export default function GuestList({
  guests,
  selectable,
  conflicts,
}: {
  guests: Guest[];
  selectable?: {
    isSelected: (i: number) => boolean;
    onToggle: (i: number) => void;
  };
  conflicts?: JoinQueueConflicts;
}): h.JSX.Element {
  if (guests.length === 0) return <p>No guests available</p>;
  return (
    <ul className="mt-3 ml-3">
      {guests.map((g, i) => (
        <li key={g.guestId} className="py-1.5 leading-tight">
          <label className="flex items-center">
            {selectable ? (
              <input
                type="checkbox"
                checked={selectable.isSelected(i)}
                onChange={() => selectable.onToggle(i)}
                className="rounded mr-4 p-2.5 text-green-500"
              />
            ) : null}
            <img
              src={g.avatarImageUrl}
              alt=""
              width="56"
              height="56"
              className="rounded-full mr-3"
            />
            <span>
              {g.firstName} {g.lastName}
              <br />
              {conflicts && g.guestId in conflicts ? (
                <span className="text-xs font-semibold text-red-700">
                  {conflicts[g.guestId].replace(/_/g, ' ')}
                </span>
              ) : null}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
