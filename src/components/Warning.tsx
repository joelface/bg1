export default function Warning({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-2 rounded border-red-600 p-1 font-semibold text-center text-red-600 bg-red-100">
      {children}
    </p>
  );
}
