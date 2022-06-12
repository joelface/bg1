import { useClient } from '/contexts/Client';
import Button from './Button';

export default function LogoutButton() {
  const client = useClient();
  return (
    <Button type="small" onClick={() => client.logOut()}>
      Log Out
    </Button>
  );
}
