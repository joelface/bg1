import { useRef, useState } from 'react';

import Overlay from '@/components/Overlay';
import News from '@/components/screens/News';
import { useGenieClient } from '@/contexts/GenieClient';
import { useNav } from '@/contexts/Nav';
import ExitIcon from '@/icons/ExitIcon';
import HeartIcon from '@/icons/HeartIcon';
import NewsIcon from '@/icons/NewsIcon';
import SettingsIcon from '@/icons/SettingsIcon';
import UserIcon from '@/icons/UserIcon';

import PartySelector from '../PartySelector';

export default function SettingsButton() {
  const { goTo } = useNav();
  const client = useGenieClient();
  const [options] = useState([
    {
      text: 'Party Selection',
      icon: <UserIcon />,
      action: () => goTo(<PartySelector />),
    },
    {
      text: 'Log Out',
      icon: <ExitIcon />,
      action: () => client.logOut(),
    },
    {
      text: 'BG1 News',
      icon: <NewsIcon />,
      action: () => goTo(<News />),
    },
    {
      text: 'Support BG1',
      icon: <HeartIcon className="text-red-600" />,
      action: () => open('https://joelface.github.io/bg1/contact.html#donate'),
    },
  ]);
  const [showingMenu, showMenu] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  return (
    <>
      <button
        className="absolute top-0 right-0 h-full px-4"
        onClick={() => showMenu(true)}
        title="Settings Menu"
      >
        <SettingsIcon />
      </button>
      {showingMenu && (
        <Overlay
          onClick={event => {
            if (!listRef.current?.contains(event.target as Element)) {
              showMenu(false);
            }
          }}
          data-testid="shade"
        >
          <ul
            className="overflow-auto min-w-[50%] max-h-[90%] rounded-lg bg-white text-black text-lg font-normal"
            ref={listRef}
          >
            {options.map(opt => {
              return (
                <li
                  className="border-t-2 first:border-0 border-gray-300"
                  key={opt.text}
                >
                  <button
                    className="flex flex-row items-center w-full px-4 py-3"
                    onClick={() => {
                      showMenu(false);
                      setTimeout(opt.action, 50);
                    }}
                  >
                    <span className="mr-2.5 text-gray-700" aria-hidden>
                      {opt.icon}
                    </span>
                    {opt.text}
                  </button>
                </li>
              );
            })}
          </ul>
        </Overlay>
      )}
    </>
  );
}
