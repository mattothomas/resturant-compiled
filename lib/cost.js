export const TO_BASE = { lb: 453.592, oz: 28.3495, kg: 1000, g: 1,
  gal: 3785.41, l: 1000, ml: 1, "fl oz": 29.5735, each: 1 };

export const OVER_TARGET = 0.35;

// cents per base unit, from one confirmed invoice line
export const costPerUnit = (line) =>
  (line.linePrice * 100) / (line.packCount * line.packSize * TO_BASE[line.packUnit]);

// costs = { ingredientName: costPerUnit }
export const plateCost = (dish, costs) =>
  dish.lines.reduce((sum, l) => sum + l.qty * costs[l.ingredient], 0);

export const foodCostPct = (dish, costs) => plateCost(dish, costs) / dish.price;

// "mass" | "volume" | "count" — a line may only update an ingredient of the same kind
const KINDS = { lb: "mass", oz: "mass", kg: "mass", g: "mass",
  gal: "volume", l: "volume", ml: "volume", "fl oz": "volume", each: "count" };
export const unitKind = (unit) => KINDS[unit];
