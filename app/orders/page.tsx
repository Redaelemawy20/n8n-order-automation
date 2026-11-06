import { listOrders } from "@/lib/db";
import AutoRefresh from "./AutoRefresh";

export const dynamic = "force-dynamic";

export default function OrdersPage() {
  const orders = listOrders();
  const totalQty = orders.reduce((sum, o) => sum + o.quantity, 0);

  return (
    <main>
      <AutoRefresh seconds={5} />
      <h1>Orders</h1>
      <p className="sub">
        {orders.length} orders · {totalQty} items total · POST to{" "}
        <code>/api/orders</code> · auto-refreshes every 5s
      </p>

      <div className="card">
        {orders.length === 0 ? (
          <div className="empty">No orders yet. Send one from n8n.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>Received (UTC)</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="num">{o.id}</td>
                  <td>{o.item_name}</td>
                  <td className="num">{o.quantity}</td>
                  <td className="num">{o.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
