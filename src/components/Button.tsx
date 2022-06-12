import { useTheme } from '/contexts/Theme';

type ButtonProps = React.HTMLProps<HTMLButtonElement>;

type Props = Omit<ButtonProps, 'type'> & {
  type?: keyof typeof TYPES;
};

const TYPES = {
  normal: 'py-1',
  small: 'py-1.5 text-xs uppercase tracking-wide',
  full: 'w-full py-3',
};

export default function Button(props: Props) {
  const { type, className, ...attrs } = props;
  const cls = (className || '') + ' ' + TYPES[type || 'normal'];
  const { bg } = useTheme();
  return (
    <button
      className={`${cls} border-2 border-white rounded-lg px-2 ${bg} text-white font-semibold disabled:opacity-50`}
      {...attrs}
    />
  );
}
