export function LegalPage({ title, sections }: { title: string; sections: { heading: string; body: string }[] }) {
  return (
    <div className="pt-32 pb-24 px-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl tracking-wide mb-10">{title}</h1>
        <div className="space-y-8 text-sm text-furikai-gray-300 leading-relaxed">
          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-furikai-white uppercase tracking-wide text-xs mb-2">{s.heading}</h2>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
