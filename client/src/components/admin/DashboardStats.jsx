import React, { useEffect, useState } from "react";
import useEcomStore from "../../store/ecom-store"; // Import Store เพื่อเอา Token
import { getOrderAdminStats } from "../../api/admin"; // (แนะนำ) ควรแยก API ไปไว้ใน folder api
import { ShoppingCart, DollarSign, Package, Loader } from "lucide-react"; // Icon สวยๆ
import { numberFormat } from "../../utils/number";
import axios from "axios";

const DashboardStats = () => {
  const token = useEcomStore((state) => state.token); // 1. ดึง Token
  const [stats, setStats] = useState({ totalOrders: 0, totalSales: 0, pendingOrders: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
        fetchStats();
    }
  }, [token]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // 2. ยิง API พร้อมแนบ Token (Header)
      // แนะนำให้สร้าง function ใน api/admin.js แต่เขียนสดตรงนี้ก็ได้ครับ
      const res = await axios.get("http://localhost:5001/api/admin/order-stats", {
        headers: {
            Authorization: `Bearer ${token}`
        }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Fetch Stats Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
      return <div className="text-center p-4">Loading stats...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      
      {/* กล่องที่ 1: ยอดขายรวม */}
      <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500 flex justify-between items-center">
        <div>
            <p className="text-gray-500 text-sm font-medium uppercase">ยอดขายรวม</p>
            <p className="text-2xl font-bold text-gray-800">{numberFormat(stats.totalSales)} ฿</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <DollarSign size={32} />
        </div>
      </div>

      {/* กล่องที่ 2: จำนวนออเดอร์ */}
      <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500 flex justify-between items-center">
        <div>
            <p className="text-gray-500 text-sm font-medium uppercase">ออเดอร์ทั้งหมด</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
        </div>
        <div className="bg-orange-100 p-3 rounded-full text-orange-600">
            <ShoppingCart size={32} />
        </div>
      </div>

      {/* กล่องที่ 3: รอจัดส่ง */}
      <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500 flex justify-between items-center">
        <div>
            <p className="text-gray-500 text-sm font-medium uppercase">รอจัดส่ง (Pending)</p>
            <p className="text-2xl font-bold text-gray-800">{stats.pendingOrders}</p>
        </div>
        <div className="bg-green-100 p-3 rounded-full text-green-600">
            <Package size={32} />
        </div>
      </div>

    </div>
  );
};

export default DashboardStats;