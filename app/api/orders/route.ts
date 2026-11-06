import { NextResponse } from "next/server";
import { createOrder, listOrders } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/orders -> list all orders
export async function GET() {
  return NextResponse.json(listOrders());
}

// POST /api/orders  body: { "item_name": "Coffee", "quantity": 2 }
// Also accepts "itemName" / "item" for convenience from n8n.
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be valid JSON" }, { status: 400 });
  }

  const itemName = String(body.item_name ?? body.itemName ?? body.item ?? "").trim();
  const quantity = Number(body.quantity);

  if (!itemName) {
    return NextResponse.json({ error: "item_name is required" }, { status: 400 });
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return NextResponse.json(
      { error: "quantity must be a positive integer" },
      { status: 400 }
    );
  }

  const order = createOrder(itemName, quantity);
  return NextResponse.json(order, { status: 201 });
}
