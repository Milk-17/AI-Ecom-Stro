import React, { useEffect, useState } from "react";
import useEcomStore from "../../store/ecom-store";
import { getOrdersAdmin } from "../../api/admin";
import { ShoppingCart, DollarSign, Package, CheckCircle, Clock } from "lucide-react";
import { numberFormat } from "../../utils/number";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

const DashboardStats = () => {
  const token = useEcomStore((state) => state.token);
  const [stats, setStats] = useState({ 
      totalSales: 0, 
      totalOrders: 0, 
      pendingOrders: 0,
      processingOrders: 0,
      completedOrders: 0 
  });
  const [salesData, setSalesData] = useState([]); // ข้อมูลสำหรับกราฟแท่ง
  const [statusData, setStatusData] = useState([]); // ข้อมูลสำหรับกราฟวงกลม
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
        fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getOrdersAdmin(token);
      let orderList = [];
      if (Array.isArray(res.data)) orderList = res.data;
      else if (res.data && Array.isArray(res.data.orders)) orderList = res.data.orders;

      // 1. คำนวณตัวเลข Card (เหมือนเดิม)
      const totalSales = orderList.reduce((sum, item) => sum + item.cartTotal, 0);
      const totalOrders = orderList.length;
      const pendingOrders = orderList.filter(o => o.orderStatus === 'Not Process').length;
      const processingOrders = orderList.filter(o => o.orderStatus === 'Processing').length;
      const completedOrders = orderList.filter(o => o.orderStatus === 'Completed').length;

      setStats({ totalSales, totalOrders, pendingOrders, processingOrders, completedOrders });

      // 2. เตรียมข้อมูลกราฟแท่ง (ยอดขาย 7 วันล่าสุด)
      // Group ยอดขายตามวันที่
      const salesByDate = {};
      orderList.forEach(order => {
          const date = new Date(order.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
          if (!salesByDate[date]) salesByDate[date] = 0;
          salesByDate[date] += order.cartTotal;
      });

      // แปลงเป็น Array ให้ Recharts
      const barData = Object.keys(salesByDate).map(date => ({
          name: date,
          sales: salesByDate[date]
      })).slice(-7); // เอาแค่ 7 วันล่าสุด

      setSalesData(barData);

      // 3. เตรียมข้อมูลกราฟวงกลม (สถานะออเดอร์)
      const pieData = [
        { name: 'รอตรวจสอบ', value: pendingOrders, color: '#9CA3AF' }, // Gray
        { name: 'กำลังดำเนินการ', value: processingOrders, color: '#3B82F6' }, // Blue
        { name: 'สำเร็จ', value: completedOrders, color: '#10B981' }, // Green
        { name: 'ยกเลิก', value: orderList.filter(o => o.orderStatus === 'Cancelled').length, color: '#EF4444' } // Red
      ];
      // กรองอันที่เป็น 0 ออก จะได้ไม่รกกราฟ
      setStatusData(pieData.filter(item => item.value > 0));

    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
      return <div className="p-4 flex justify-center text-gray-400">Loading Stats...</div>
  }

  return (
    <div>
        {/* --- 1. Stats Cards (ส่วนตัวเลข) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase">ยอดขายรวม</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{numberFormat(stats.totalSales)}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-full text-blue-600"><DollarSign size={24} /></div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase">คำสั่งซื้อ</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalOrders}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-full text-orange-600"><ShoppingCart size={24} /></div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase">รอตรวจสอบ</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.pendingOrders}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-full text-yellow-600"><Clock size={24} /></div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase">สำเร็จ</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.completedOrders}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-full text-green-600"><CheckCircle size={24} /></div>
            </div>
        </div>

        {/* --- 2. Charts Section (ส่วนกราฟ) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Sales Bar Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                <h3 className="text-lg font-bold text-gray-800 mb-4">ยอดขายรายวัน (7 วันล่าสุด)</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{fontSize: 12}} />
                            <YAxis tick={{fontSize: 12}} />
                            <Tooltip formatter={(value) => numberFormat(value)} />
                            <Bar dataKey="sales" fill="#3B82F6" name="ยอดขาย (บาท)" radius={[4, 4, 0, 0]} barSize={40}/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Status Pie Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">สถานะคำสั่งซื้อ</h3>
                <div className="h-[300px] w-full flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>
  );
};

export default DashboardStats;