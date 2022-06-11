import Button from './Button';

export default function FloatingButton({
  onClick,
  disabled,
  href,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-20">
      <div className="fixed bottom-0 left-0 w-full bg-white bg-opacity-75 text-center">
        <a href={href} className="block max-w-2xl mx-auto px-3 pb-5">
          <Button type="full" onClick={onClick} disabled={disabled}>
            {children}
          </Button>
        </a>
      </div>
    </div>
  );
}
