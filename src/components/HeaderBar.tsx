import { Children, Fragment, cloneElement, isValidElement } from 'react';

import { useTheme } from '@/contexts/Theme';
import Button from './Button';

export default function HeaderBar({
  title,
  children,
}: {
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { bg, text } = useTheme();

  function changeButtonColors(node: React.ReactNode): React.ReactNode {
    if (!isValidElement(node)) return node;
    if (node.type === Fragment) {
      return Children.map(node.props.children, changeButtonColors);
    }
    return cloneElement(node as ReturnType<typeof Button>, {
      className: `bg-white bg-opacity-90 ${text} ${node.props.className || ''}`,
    });
  }

  return (
    <div
      className={`flex justify-end gap-x-2 gap-y-1 min-h-[52px] px-3 py-2 text-lg text-white ${bg}`}
    >
      <h1 className="flex-1 self-center py-0.5 text-xl font-semibold overflow-hidden whitespace-nowrap">
        {title}
      </h1>
      {changeButtonColors(children)}
    </div>
  );
}
