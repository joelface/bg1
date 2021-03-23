import { h, ComponentChildren } from 'preact';

interface Props {
  onClick?: () => void;
  disabled?: boolean;
  href?: string;
  children: ComponentChildren;
}

export default function FloatingButton({
  onClick,
  disabled,
  href,
  children,
}: Props): h.JSX.Element {
  return (
    <div className="mb-20">
      <div className="fixed bottom-0 left-0 w-full bg-white bg-opacity-75 text-center">
        <a href={href} className="block max-w-2xl mx-auto px-3 pb-5">
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-full p-3 rounded-lg bg-blue-500 text-white font-semibold focus:outline-none focus:ring focus:ring-blue-600 focus:ring-offset-2 disabled:bg-gray-400"
          >
            {children}
          </button>
        </a>
      </div>
    </div>
  );
}
