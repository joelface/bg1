import { useCallback, useState } from 'react';

import Button from '../Button';
import FloatingButton from '../FloatingButton';
import LogoutButton from '../LogoutButton';
import Page from '../Page';
import PartySelector from './PartySelector';

const screens = {
  party: PartySelector,
} as const;

type ScreenName = keyof typeof screens;

export default function Settings({ onClose }: { onClose: () => void }) {
  const [screenName, show] = useState<ScreenName>();
  const returnToMenu = useCallback(() => show(undefined), []);
  if (screenName) {
    const Screen = screens[screenName];
    return <Screen onClose={returnToMenu} />;
  }
  return (
    <Page heading="Settings">
      <ul className="mt-4">
        <MenuItem
          button={<Button onClick={() => show('party')}>Select Party</Button>}
          desc="BG01's automatic party selection works great for most people, but manually specifying your party may be useful for larger groups or other special situations."
        />
        <MenuItem
          button={<LogoutButton />}
          desc="You should only need to use this if you logged in with the wrong account."
        />
      </ul>
      <FloatingButton onClick={onClose}>Close</FloatingButton>
    </Page>
  );
}

function MenuItem({ button, desc }: { button: React.ReactNode; desc: string }) {
  return (
    <li>
      <div className="text-center">{button}</div>
      <p className="mt-2">{desc}</p>
    </li>
  );
}
