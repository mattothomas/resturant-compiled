import { MongoClient } from "mongodb";

const ingredients = [
  { name: "flour", unit: "g", costPerUnit: 0.1323 },
  { name: "tomato sauce", unit: "g", costPerUnit: 0.1667 },
  { name: "mozzarella", unit: "g", costPerUnit: 0.8818 },
  { name: "olive oil", unit: "ml", costPerUnit: 1.0 },
  { name: "sub roll", unit: "each", costPerUnit: 50 },
  { name: "chicken breast", unit: "g", costPerUnit: 0.6614 },
  { name: "chicken wings", unit: "g", costPerUnit: 0.6173 },
  { name: "hot sauce", unit: "ml", costPerUnit: 0.317 },
  { name: "blue cheese dressing", unit: "g", costPerUnit: 0.8818 },
  { name: "celery", unit: "g", costPerUnit: 0.3307 },
];
const dishes = [
  { name: "Margherita pizza", price: 1400, lines: [
    { ingredient: "flour", qty: 250 }, { ingredient: "tomato sauce", qty: 120 },
    { ingredient: "mozzarella", qty: 200 }, { ingredient: "olive oil", qty: 10 } ] },
  { name: "Chicken parm sub", price: 1200, lines: [
    { ingredient: "sub roll", qty: 1 }, { ingredient: "chicken breast", qty: 225 },
    { ingredient: "mozzarella", qty: 85 }, { ingredient: "tomato sauce", qty: 90 } ] },
  { name: "Buffalo wings (10)", price: 1100, lines: [
    { ingredient: "chicken wings", qty: 450 }, { ingredient: "hot sauce", qty: 60 },
    { ingredient: "blue cheese dressing", qty: 60 }, { ingredient: "celery", qty: 40 } ] },
];

const client = await new MongoClient(process.env.MONGODB_URI).connect();
const db = client.db();
for (const [name, docs] of [["ingredients", ingredients], ["dishes", dishes]]) {
  await db.collection(name).deleteMany({});
  await db.collection(name).insertMany(docs);
}
console.log(`seeded ${ingredients.length} ingredients, ${dishes.length} dishes`);
await client.close();
