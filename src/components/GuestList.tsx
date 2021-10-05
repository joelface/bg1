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
}): h.JSX.Element | null {
  if (guests.length === 0) return null;
  return (
    <ul className="mt-3 ml-3">
      {guests.map((g, i) => (
        <li key={g.guestId} className="py-1.5">
          <label className="flex items-center">
            {selectable ? (
              <input
                type="checkbox"
                checked={selectable.isSelected(i)}
                onChange={() => selectable.onToggle(i)}
                className="rounded mr-4 p-2.5 text-green-500"
              />
            ) : null}
            {g.avatarImageUrl ? (
              <img
                src={g.avatarImageUrl}
                alt=""
                width="56"
                height="56"
                className="rounded-full"
              />
            ) : (
              <span
                className="rounded-full text-3xl font-bold text-center bg-purple-600 text-white"
                style={{ width: '56px', lineHeight: '56px' }}
              >
                {(g.firstName + g.lastName)[0]}
              </span>
            )}
            <span className="ml-3">
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
