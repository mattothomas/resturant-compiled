import Anthropic from "@anthropic-ai/sdk";
import { getDb } from "@/lib/db";

export const maxDuration = 60;
const client = new Anthropic({ baseURL: "https://api.deepseek.com/anthropic", apiKey: process.env.DEEPSEEK_API_KEY });

const parse = (text) => JSON.parse(text.replace(/```json|```/g, "").trim());

export async function POST(req) {
  const file = (await req.formData()).get("file");
  if (!file || typeof file === "string") return Response.json({ error: "No file" }, { status: 400 });

  const data = Buffer.from(await file.arrayBuffer()).toString("base64");
  const fileBlock = file.type === "application/pdf"
    ? { type: "document", source: { type: "base64", media_type: "application/pdf", data } }
    : { type: "image", source: { type: "base64", media_type: file.type, data } };

  const db = await getDb();
  const names = (await db.collection("ingredients").find({}, { projection: { name: 1 } }).toArray()).map((i) => i.name);
  const prompt = `Read this supplier invoice. Return ONLY a JSON array, no other text.
One object per line item:
{"description": text as printed, "ingredient": one of ${JSON.stringify(names)} or null,
 "packCount": number, "packSize": number,
 "packUnit": "lb"|"oz"|"kg"|"g"|"gal"|"l"|"ml"|"fl oz"|"each", "linePrice": dollars}
packCount is packs per case times cases shipped; linePrice is the extended line total.
Example: "WINGS JUMBO 4/10LB 136.00" -> packCount 4, packSize 10, packUnit "lb", linePrice 136`;

  let text = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    let msg;
    try {
      msg = await client.messages.create({
        model: "deepseek-flash",
        max_tokens: 8000, // deepseek-flash thinks first; 2000 sometimes ran out before any text
        messages: [{ role: "user", content: [fileBlock, { type: "text", text: prompt }] }],
      });
    } catch (e) {
      return Response.json({ error: `AI read failed: ${e.message}` }, { status: 502 });
    }
    text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
    try {
      return Response.json({ lines: parse(text) });
    } catch {}
  }
  return Response.json({ error: "Couldn't read the invoice", raw: text }, { status: 502 });
}
