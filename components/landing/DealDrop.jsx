import s from "./DealDrop.module.css";

// Static markup mirroring DealCard's anatomy; timeline lives in DealDrop.module.css (8s loop).
// ponytail: "Demo Kitchen" matches the seeded demo restaurant; lib/config.js no longer exists.
export default function DealDrop() {
  return (
    <div
      role="img"
      aria-label="Animation: a phone shows no deals, then Demo Kitchen drops Buffalo wings (10) for $6.00, down from $11.00. The count ticks from 8 left to 6 left, a student taps Claim, and the screen says: You're in. Show this screen at the counter. 5 left."
      className={s.phone}
    >
      <div aria-hidden="true" className={s.screen}>
        <p className={s.bar}>Deals downtown</p>

        <p className={s.empty}>Nothing dropping yet</p>
        <p className={s.toast}>Just dropped</p>

        <div className={s.card}>
          <div className={s.head}>
            <span className={s.letter}>B</span>
            <span className={s.place}>Demo Kitchen</span>
          </div>
          <div className={s.body}>
            <div className={s.row}>
              <span className={s.dish}>Buffalo wings (10)</span>
              <span className={s.chip}>
                <span className={`${s.n} ${s.n8}`}>8 left</span>
                <span className={`${s.n} ${s.n7}`}>7 left</span>
                <span className={`${s.n} ${s.n6}`}>6 left</span>
                <span className={`${s.n} ${s.n5}`}>5 left</span>
              </span>
            </div>
            <div className={s.stack}>
              <div className={s.offer}>
                <p className={s.muted}>Pickup until 11:00 PM</p>
                <p className={s.prices}><s className={s.muted}>$11.00</s><b className={s.price}>$6.00</b></p>
              </div>
              <p className={s.confirm}>You&apos;re in. Show this screen at the counter.</p>
            </div>
            <div className={s.btn}>
              <span className={s.claim}>Claim</span>
              <span className={s.claimed}>Claimed ✓</span>
              <span className={s.ripple} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
