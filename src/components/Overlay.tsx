interface Props extends React.HTMLProps<HTMLDivElement> {
  color?: string;
}

export default function Overlay(props: Props) {
  const { children, color = 'bg-black', className = '', ...attrs } = props;
  return (
    <div
      className={`fixed inset-0 z-10 flex items-center justify-center p-2 ${color} bg-opacity-75 ${className}`}
      {...attrs}
    >
      {children}
    </div>
  );
}
