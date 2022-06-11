type Props = Omit<React.HTMLProps<HTMLDivElement>, 'className'> & {
  className?: string | { outer?: string; inner?: string };
};

export default function Overlay(props: Props) {
  const { children, className, ...attrs } = props;
  const classNames = {
    outer: '',
    inner: '',
    ...(typeof className === 'string' ? { inner: className } : className),
  };

  return (
    <div className={`${classNames.outer} fixed inset-0`} {...attrs}>
      <div className={`${classNames.inner} max-w-2xl min-h-full mx-auto`}>
        {children}
      </div>
    </div>
  );
}
