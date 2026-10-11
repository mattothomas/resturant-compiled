const NOTES = [
  { number: "01", title: "See what is hot", body: "Live deals from the places you already know, while they are still worth crossing town for." },
  { number: "02", title: "Keep the kitchen honest", body: "Owners see the actual cost behind every plate before a bad margin becomes a bad month." },
  { number: "03", title: "Give good food a second shift", body: "A slower dinner service becomes a reason for somebody nearby to walk through the door." },
];

const LOCAL_MENU_NOTES = [
  ["Big Bowl Noodle House", "noodle bowls"],
  ["Sizzling Bites", "chicken thigh platters"],
  ["Halal Cart", "rice bowl platters"],
  ["Uncle Chens", "the late-night special"],
  ["Osaka", "California rolls + gyoza"],
  ["Subway", "footlongs + wraps"],
  ["Raising Cane's", "chicken fingers + Texas toast"],
  ["Big Deans", "Big Daddy 6"],
  ["Harry's Hotdogs", "dogs with a point of view"],
  ["Little Anthony's", "pizza + wings"],
  ["Little Chef", "the neighborhood classic"],
  ["Double D Diner", "late breakfast energy"],
  ["Jack's Pizza", "a slice for the walk home"],
];

export function LessWaste() {
  return (
    <section>
      <div className="mb-10 flex items-end justify-between gap-5">
        <div>
          <p className="eyebrow">A small system with a real point</p>
          <h2 className="mt-3 text-4xl font-bold tracking-[-0.03em] md:text-6xl">Less waste. More neighborhood.</h2>
        </div>
      </div>
      <div className="grid gap-px border border-ink/20 bg-ink/20 md:grid-cols-3">
        {NOTES.map((note) => (
          <article key={note.number} className="bg-surface p-6 hover:-translate-y-1 md:min-h-[270px] md:p-8">
            <span className="mono font-bold text-ink/60">{note.number}</span>
            <h3 className="mt-14 text-2xl font-bold leading-tight">{note.title}</h3>
            <p className="mt-4 leading-relaxed text-ink/75">{note.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function LocalTells() {
  return (
    <section>
      <div className="flex flex-col gap-5 border-b border-ink pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">A few local tells</p>
          <h2 className="mt-3 text-4xl font-bold tracking-[-0.03em] md:text-6xl">The board knows the neighborhood.</h2>
        </div>
        <p className="max-w-xs leading-relaxed text-ink/70">Menu cues from the spots we called. Not live inventory. Just a little proof that this is for here.</p>
      </div>
      <div className="grid grid-cols-1 border-l border-ink/20 md:grid-cols-2 lg:grid-cols-3">
        {LOCAL_MENU_NOTES.map(([restaurant, cue]) => (
          <div key={restaurant} className="group flex min-h-24 items-end justify-between gap-4 border-b border-r border-ink/20 p-4 hover:bg-action">
            <span className="font-bold">{restaurant}</span>
            <span className="mono text-right text-ink/60 group-hover:text-ink">{cue}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
