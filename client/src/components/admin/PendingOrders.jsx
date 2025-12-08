// src/components/admin/PendingOrders.jsx
// ======= Start Fix: Pending Orders Component =======
import React, { useEffect, useState } from "react";
import axios from "axios";

const PendingOrders = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/order/pending");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-md p-4">
      <h2 className="text-lg font-bold mb-4">Pending Orders</h2>
      <table className="min-w-full table-auto border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Order ID</th>
            <th className="px-4 py-2 border">Customer</th>
            <th className="px-4 py-2 border">Total</th>
            <th className="px-4 py-2 border">Created At</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">{o.id}</td>
              <td className="px-4 py-2 border">{o.orderedBy?.name || o.orderedBy?.email}</td>
              <td className="px-4 py-2 border">{o.cartTotal.toLocaleString()} ฿</td>
              <td className="px-4 py-2 border">{new Date(o.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PendingOrders;
// ======= End Fix =======