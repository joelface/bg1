import Button from '@/components/Button';
import LogoutButton from '@/components/LogoutButton';
import Screen from '@/components/Screen';
import { useNav } from '@/contexts/Nav';

import PartySelector from './PartySelector';

export default function Settings() {
  const { goTo } = useNav();
  return (
    <Screen heading="Settings">
      <ul className="mt-4">
        <MenuItem
          button={
            <Button onClick={() => goTo(<PartySelector />)}>
              Select Party
            </Button>
          }
          desc="BG1's automatic party selection works great for most people, but manually specifying your party may be useful for larger groups or other special situations."
        />
        <MenuItem
          button={<LogoutButton />}
          desc="You should only need to use this if you logged in with the wrong account."
        />
      </ul>
    </Screen>
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
