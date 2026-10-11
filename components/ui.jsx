export function Button({ className = "", ...props }) {
  return (
    <button
      className={`min-h-14 w-full rounded-xl bg-deal px-6 text-xl font-bold text-navy disabled:opacity-50 md:min-h-16 md:w-auto ${className}`}
      {...props}
    />
  );
}

export function Card({ className = "", ...props }) {
  return <div className={`rounded-2xl bg-white p-5 shadow ${className}`} {...props} />;
}

// integer cents → $X.XX
export function Money({ cents, className = "" }) {
  return <span className={className}>${(cents / 100).toFixed(2)}</span>;
}

const TONES = { loss: "bg-loss text-white", margin: "bg-margin text-white", deal: "bg-deal text-navy" };
export function Badge({ tone = "deal", className = "", ...props }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-base font-bold ${TONES[tone]} ${className}`} {...props} />
  );
}
