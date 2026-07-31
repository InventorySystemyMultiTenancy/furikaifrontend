export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 pt-32 pb-16">
      <div className="w-full max-w-md">
        <h1 className="font-display text-4xl tracking-wide text-center mb-2">{title}</h1>
        {subtitle && <p className="text-sm text-furikai-gray-400 text-center mb-8">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

export const inputClass =
  "w-full bg-transparent border border-furikai-gray-700 px-4 py-3 text-sm placeholder:text-furikai-gray-500 focus:outline-none focus:border-furikai-white";

export const primaryButtonClass =
  "w-full py-3.5 bg-furikai-red-bright text-sm uppercase tracking-wider hover:bg-furikai-red transition-colors disabled:opacity-50";
