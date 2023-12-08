export interface IconProps {
  className?: string;
  title?: string;
}

export default function Icon({
  children,
  className,
  title,
}: IconProps & { children: React.ReactNode }) {
  className ||= '';
  if (!className.match(/\bw-\S+\s*/)) className += ' w-4';
  if (!className.match(/\bh-\S+\s*/)) className += ' h-auto';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 16 16"
      className={`mx-auto ${className}`}
      role="img"
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}
