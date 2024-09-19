import { Children, Fragment, cloneElement, isValidElement } from 'react';

import { useScreens } from '@/contexts/Nav';
import { useTheme } from '@/contexts/Theme';
import BackIcon from '@/icons/BackIcon';

import Button from './Button';

export default function HeaderBar({
  title,
  subhead,
  children,
}: {
  title: React.ReactNode;
  subhead?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { prev } = useScreens();
  const { bg, text } = useTheme();

  function changeButtonColors(node: React.ReactNode): React.ReactNode {
    if (!isValidElement(node) || typeof node.type === 'string') return node;
    if (node.type === Fragment) {
      return Children.map(node.props.children, changeButtonColors);
    }
    return cloneElement(node as ReturnType<typeof Button>, {
      className: `min-h-[36px] bg-white bg-opacity-90 ${text} ${node.props.className || ''}`,
    });
  }

  return (
    <div className={`px-3 ext-lg text-white ${bg}`}>
      <div className="flex flex-wrap justify-end gap-x-2 gap-y-1 min-h-[36px] py-2">
        {!!prev && (
          <Button back className="-my-2 -ml-3" title="Go Back">
            <BackIcon />
          </Button>
        )}
        <h1 className="flex-1 self-center py-1 text-xl font-semibold overflow-hidden whitespace-nowrap">
          {title}
        </h1>
        {changeButtonColors(children)}
      </div>
      <div
        className={`empty:hidden flex flex-col gap-y-1 pb-1 ${bg} text-white text-sm font-semibold uppercase text-center`}
      >
        {subhead}
      </div>
    </div>
  );
}
