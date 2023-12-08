export default function Warning(props: React.HTMLProps<HTMLDivElement>) {
  return (
    <div
      className={`mt-4 border-2 rounded border-red-600 p-1 font-semibold text-center text-red-600 bg-red-100 ${props.className}`}
    >
      {props.children}
    </div>
  );
}
