import { useTheme } from '@/contexts/Theme';

type Props = Omit<React.HTMLProps<HTMLButtonElement>, 'type'> & {
  type?: keyof typeof TYPES;
};

const TYPES = {
  normal: 'py-1',
  small: 'py-1.5 text-xs uppercase tracking-wide',
  full: 'w-full py-3',
};

export default function Button(props: Props) {
  const { type, className, ...attrs } = props;
  let cls = `${TYPES[type || 'normal']} ${className || ''}`;
  const { bg } = useTheme();
  if (!cls.includes(' bg-')) cls += ` ${bg} text-white`;
  return (
    <button
      className={`${cls} inline-flex items-center justify-center min-w-[36px] rounded-lg px-2 font-semibold disabled:opacity-50`}
      {...attrs}
    />
  );
}
