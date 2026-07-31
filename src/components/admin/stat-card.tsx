export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border border-furikai-gray-700 p-5">
      <p className="text-xs uppercase tracking-wider text-furikai-gray-500">{label}</p>
      <p className="font-display text-3xl mt-1">{value}</p>
      {hint && <p className="text-xs text-furikai-gray-500 mt-1">{hint}</p>}
    </div>
  );
}
