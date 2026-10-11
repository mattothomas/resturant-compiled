const BTN = {
  primary: "bg-action text-ink hover:bg-[#f0c95b]",
  secondary: "bg-paper text-ink hover:bg-surface",
};
export function Button({ variant = "primary", className = "", ...props }) {
  return (
    <button
      className={`inline-flex h-14 w-full items-center justify-center border-2 border-ink px-6 text-xl font-bold md:h-16 md:w-auto ${BTN[variant]} hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
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

// margin/deal are legacy aliases for healthy/suggested-fill used by existing pages
const TONES = {
  loss: "bg-loss text-white border-loss",
  healthy: "bg-margin text-white border-margin",
  neutral: "bg-transparent text-ink border-ink",
  suggested: "bg-transparent text-ink border-action",
  margin: "bg-margin text-white border-margin",
  deal: "bg-action text-ink border-action",
};
export function Badge({ tone = "deal", className = "", ...props }) {
  return <span className={`inline-block rounded-full border-2 px-3 py-1 text-base font-bold uppercase tracking-wide ${TONES[tone]} ${className}`} {...props} />;
}
