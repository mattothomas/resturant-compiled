import { MongoClient } from "mongodb";

const client = await new MongoClient(process.env.MONGODB_URI).connect();
const db = client.db();
const demo = await db.collection("restaurants").findOne({ name: "Demo Kitchen" });
if (!demo) throw new Error("Demo Kitchen restaurant was not found");

const scope = { $or: [{ restaurantId: { $exists: false } }, { restaurantId: null }] };
const ingredients = await db.collection("ingredients").updateMany(scope, { $set: { restaurantId: demo._id } });
const dishes = await db.collection("dishes").updateMany(scope, { $set: { restaurantId: demo._id } });
const prices = await db.collection("prices").updateMany(scope, { $set: { restaurantId: demo._id } });

const activeCount = await db.collection("deals").countDocuments({ restaurantId: demo._id, expiresAt: { $gt: new Date() } });
let deals = 0;
if (!activeCount) {
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const result = await db.collection("deals").insertMany([
    { restaurantId: demo._id, restaurantName: demo.name, dishName: "Margherita pizza", normalPrice: 1400, dealPrice: 700, qtyLeft: 5, expiresAt },
    { restaurantId: demo._id, restaurantName: demo.name, dishName: "Chicken parm sub", normalPrice: 1200, dealPrice: 600, qtyLeft: 4, expiresAt },
  ]);
  deals = result.insertedCount;
}

console.log(JSON.stringify({ restaurant: demo.name, scoped: { ingredients: ingredients.modifiedCount, dishes: dishes.modifiedCount, prices: prices.modifiedCount }, activeDealsAdded: deals }, null, 2));
await client.close();
