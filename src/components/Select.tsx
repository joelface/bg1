import { h } from 'preact';

import { useTheme } from '@/contexts/Theme';

type Props = h.JSX.HTMLAttributes<HTMLSelectElement>;

export default function Select(props: Props): h.JSX.Element {
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
