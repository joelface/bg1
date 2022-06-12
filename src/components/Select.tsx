import { useTheme } from '/contexts/Theme';

type Props = React.HTMLProps<HTMLSelectElement>;

export default function Select(props: Props) {
  const { className, ...attrs } = props;
  const { bg } = useTheme();
  return (
    <select
      className={`${
        className || ''
      } border-2 border-white rounded-lg px-1 ${bg} font-semibold disabled:opacity-50`}
      {...attrs}
    />
  );
}
