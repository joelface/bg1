import { useClient } from '@/contexts/Client';

import Button from './Button';

export default function LogoutButton({ type }: { type?: 'small' }) {
  const client = useClient();
  return (
    <Button type={type} onClick={() => client.logOut()}>
      Log Out
    </Button>
  );
}
