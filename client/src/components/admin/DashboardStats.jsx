// src/components/admin/DashboardStats.jsx
// ======= Start Fix: Dashboard Stats Component =======
import React, { useEffect, useState } from "react";
import axios from "axios";

const DashboardStats = () => {
  const [stats, setStats] = useState({ totalOrders: 0, totalSales: 0, pendingOrders: 0 });

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/order/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white shadow rounded-md p-6 text-center">
        <h3 className="text-gray-500">Total Orders</h3>
        <p className="text-2xl font-bold">{stats.totalOrders}</p>
      </div>
      <div className="bg-white shadow rounded-md p-6 text-center">
        <h3 className="text-gray-500">Total Sales</h3>
        <p className="text-2xl font-bold">{stats.totalSales.toLocaleString()} ฿</p>
      </div>
      <div className="bg-white shadow rounded-md p-6 text-center">
        <h3 className="text-gray-500">Pending Orders</h3>
        <p className="text-2xl font-bold">{stats.pendingOrders}</p>
      </div>
    </div>
  );
};

export default DashboardStats;
// ======= End Fix =======