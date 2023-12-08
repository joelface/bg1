import Button from '@/components/Button';
import RefreshIcon from '@/icons/RefreshIcon';

interface Props extends Omit<React.HTMLProps<HTMLButtonElement>, 'type'> {
  name: string;
  onClick: () => void;
}

export default function RefreshButton({ name, onClick, ...props }: Props) {
  return (
    <Button {...props} title={`Refresh ${name}`} onClick={onClick}>
      <RefreshIcon />
    </Button>
  );
}
