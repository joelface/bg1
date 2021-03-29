import { h, Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import FloatingButton from './FloatingButton';

export default function Disclaimer({
  onAccept,
}: {
  onAccept: () => void;
}): h.JSX.Element {
  return (
    <>
      <h1 className="text-xl font-semibold">Disclaimer</h1>
      <p>
        Use at your own risk. BG1 is highly experimental and provided &quot;as
        is&quot; without warranty of any kind. It could stop working at any time
        for any reason. There is no guarantee that using BG1 will actually help
        you obtain a boarding group, and it should not be relied on for this or
        any other purpose. Always use the official Disney app.
      </p>
      <FloatingButton onClick={onAccept}>Accept</FloatingButton>
    </>
  );
}

export function useDisclaimer(
  storage = localStorage,
  acceptedKey = 'disclaimerAccepted'
): [boolean, () => void] {
  const [accepted, setAccepted] = useState(!!storage.getItem(acceptedKey));

  useEffect(() => {
    if (accepted) storage.setItem(acceptedKey, '1');
  }, [accepted, storage, acceptedKey]);

  return [accepted, () => setAccepted(true)];
}
