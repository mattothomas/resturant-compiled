import s from "./InvoiceToPlate.module.css";

const LINES = [
  ["CHICKEN WINGS JUMBO 4/10LB", "136.00"],
  ["CHEESE MOZZ WH SHRD 4/5LB", "80.00"],
  ["FLOUR ALL PURP 1/50LB", "30.00"],
];
const ROWS = [["Chicken wings", null], ["Mozzarella", "80.00"], ["Flour", "30.00"]];

// Timeline lives in InvoiceToPlate.module.css (10s loop).
export default function InvoiceToPlate() {
  return (
    <div
      role="img"
      aria-label="Animation: a paper invoice with chicken wings $136.00, mozzarella $80.00 and flour $30.00 is scanned. Three suggested rows appear; the wings price, misread as 186.00, is corrected to 136.00. Save costs is pressed, and Buffalo wings (10) goes from 33% to 38% food cost, over the 35% target, with wings up 21% and plate cost up $0.59 to $4.22."
      className={s.wrap}
    >
      <div aria-hidden="true" className={s.cycle}>
        <div className={s.top}>
          <div className={s.paper}>
            {LINES.map(([name, amt]) => (
              <p key={name} className={s.line}><span>{name}</span><span>{amt}</span></p>
            ))}
            <span className={s.scan} />
          </div>
          <div className={s.rows}>
            {ROWS.map(([name, amt]) => (
              <div key={name} className={s.rowItem}>
                <span className={s.ing}>{name}</span>
                <span className={`${s.field} ${amt ? "" : s.fix}`}>
                  {amt ?? <><span className={s.old}>186.00</span><span className={s.new}>136.00</span></>}
                </span>
                <span className={s.chipS}>Suggested</span>
              </div>
            ))}
            <span className={s.save}>Save costs</span>
          </div>
        </div>

        <div className={s.dish}>
          <div className={s.dishHead}>
            <span className={s.dishName}>Buffalo wings (10)</span>
            <span className={s.badge}>Over cost target</span>
          </div>
          <div className={s.nums}>
            <span className={s.stackN}>
              <span className={s.before}>33%</span><span className={s.after}>38%</span>
            </span>
            <span className={s.label}>food cost · target 35%</span>
          </div>
          <div className={s.foot}>
            <span>Plate cost <b className={s.stackN}><span className={s.before}>$3.63</span><span className={s.after}>$4.22</span></b></span>
            <span className={s.up}>Wings +21% · +$0.59/plate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
