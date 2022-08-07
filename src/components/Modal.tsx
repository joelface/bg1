import Button from './Button';
import Overlay from './Overlay';

export default function Modal({
  heading,
  onClose,
  children,
}: {
  heading: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Overlay
      className={{
        outer: 'bg-black bg-opacity-75',
        inner: 'p-2 flex items-center justify-center h-full',
      }}
      onClick={onClose}
    >
      <div
        className="flex flex-col max-h-[90%] rounded-lg px-3 py-4 bg-white"
        onClick={event => event.stopPropagation()}
      >
        <h2 className="mt-0">{heading}</h2>
        <div className="flex-1 overflow-auto">{children}</div>
        <div className="pt-4">
          <Button type="full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Overlay>
  );
}
