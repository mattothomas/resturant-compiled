import { randomBytes, scryptSync } from "node:crypto";
import { MongoClient } from "mongodb";

const password = process.env.DEMO_PASSWORD;
if (!password) throw new Error("Set DEMO_PASSWORD in .env.local");

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
for (const name of ["restaurants", "sessions", "ingredients", "dishes", "deals", "invoices", "prices"])
  await db.collection(name).deleteMany({});
await db.collection("restaurants").createIndex({ email: 1 }, { unique: true });
await db.collection("sessions").createIndex({ tokenHash: 1 }, { unique: true });

// same hashing as lib/auth.js hashPassword
const salt = randomBytes(16).toString("hex");
const { insertedId: restaurantId } = await db.collection("restaurants").insertOne({
  name: "Demo Kitchen", email: "demo@kitchen.test", salt, passwordHash: scryptSync(password, salt, 64).toString("hex"),
});
const date = new Date(new Date().toISOString().slice(0, 10)); // prices are dated by calendar day
await db.collection("ingredients").insertMany(ingredients.map((i) => ({ restaurantId, ...i })));
await db.collection("dishes").insertMany(dishes.map((d) => ({ restaurantId, ...d })));
await db.collection("prices").insertMany(ingredients.map((i) =>
  ({ restaurantId, ingredient: i.name, costPerUnit: i.costPerUnit, source: "manual", date })));
console.log(`seeded Demo Kitchen (demo@kitchen.test): ${ingredients.length} ingredients, ${dishes.length} dishes; cleared sessions, invoices, deals`);
await client.close();
