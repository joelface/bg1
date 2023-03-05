import { useNav } from '@/contexts/Nav';
import { useTheme } from '@/contexts/Theme';

type Props = Omit<React.HTMLProps<HTMLButtonElement>, 'type' | 'onClick'> & {
  onClick?: () => void | Promise<void>;
  type?: keyof typeof TYPES;
  back?: boolean | Parameters<ReturnType<typeof useNav>['goBack']>[0];
};

const TYPES = {
  normal: 'py-1',
  small: 'py-1.5 text-xs uppercase tracking-wide',
  full: 'w-full py-3',
};

export default function Button(props: Props) {
  const { goBack } = useNav();
  const { type, back, onClick, className, ...attrs } = props;
  let cls = `${TYPES[type || 'normal']} ${className || ''}`;
  const { bg } = useTheme();
  if (!cls.includes(' bg-')) cls += ` ${bg} text-white`;
  return (
    <button
      onClick={async () => {
        if (onClick) await onClick();
        if (back) {
          if (back === true) {
            goBack();
          } else {
            goBack(back);
          }
        }
      }}
      className={`${cls} inline-flex items-center justify-center min-w-[36px] rounded-lg px-2 font-semibold disabled:opacity-50`}
      {...attrs}
    />
  );
}
