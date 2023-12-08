export default function Notice(props: React.HTMLProps<HTMLDivElement>) {
  return (
    <div
      className={`mt-4 border-2 rounded border-green-600 p-1 font-semibold text-center text-green-600 bg-green-100 ${props.className}`}
    >
      {props.children}
    </div>
  );
}
