import { h } from 'preact';

import { useClient } from '@/contexts/Client';
import Button from './Button';

export default function LogoutButton(): h.JSX.Element {
  const client = useClient();
  return (
    <Button type="small" onClick={() => client.logOut()}>
      Log Out
    </Button>
  );
}
