import { useNav } from '@/contexts/Nav';
import SettingsIcon from '@/icons/SettingsIcon';

import Settings from '../Settings';

export default function SettingsButton() {
  const { goTo } = useNav();
  return (
    <button
      className="absolute top-0 right-0 h-full px-3"
      onClick={() => goTo(<Settings />)}
      title="Settings"
    >
      <SettingsIcon />
    </button>
  );
}
