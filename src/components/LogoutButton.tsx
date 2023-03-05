import { useClient } from '@/contexts/Client';

import Button from './Button';

export default function LogoutButton(props: Parameters<typeof Button>[0]) {
  const client = useClient();
  return (
    <Button {...props} onClick={() => client.logOut()}>
      Log Out
    </Button>
  );
}
