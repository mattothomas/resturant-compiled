export function Button({ className = "", ...props }) {
  return (
    <button
      className={`min-h-12 w-full border-2 border-ink bg-action px-5 text-base font-bold text-ink hover:-translate-y-0.5 hover:bg-[#f0c95b] disabled:cursor-not-allowed disabled:opacity-50 md:w-auto ${className}`}
      {...props}
    />
  );
}

export function Card({ className = "", ...props }) {
  return <div className={`border border-rule bg-surface p-5 ${className}`} {...props} />;
}

// integer cents → $X.XX
export function Money({ cents, className = "" }) {
  return <span className={className}>${(cents / 100).toFixed(2)}</span>;
}

const TONES = { loss: "bg-loss text-white", margin: "bg-margin text-white", deal: "bg-action text-ink" };
export function Badge({ tone = "deal", className = "", ...props }) {
  return <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${TONES[tone]} ${className}`} {...props} />;
}
