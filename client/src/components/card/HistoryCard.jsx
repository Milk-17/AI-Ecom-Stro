import React, { useState, useEffect } from "react";
import { getOrders } from "../../api/user";
import useEcomStore from "../../store/ecom-store";
import { numberFormat } from "../../utils/number";
import { toast } from "react-toastify";
import { Calendar, MapPin, Package, AlertCircle } from "lucide-react"; // เพิ่ม Icons

const HistoryCard = () => {
  const token = useEcomStore((state) => state.token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false); // เพิ่ม Loading State

  useEffect(() => {
    hdlGetOrders(token);
  }, []);

  const hdlGetOrders = async (token) => {
    setLoading(true);
    try {
      const res = await getOrders(token);
      if (res.data.success) {
        setOrders(res.data.orders);
      } else {
        toast.warning(res.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch orders!");
    } finally {
      setLoading(false);
    }
  };

  // ปรับสีให้ดู Modern ขึ้น
  const getStatusColor = (status) => {
    switch (status) {
      case "Not Process":
        return "bg-gray-100 text-gray-600 border border-gray-200";
      case "Processing":
        return "bg-blue-100 text-blue-600 border border-blue-200";
      case "Completed":
        return "bg-green-100 text-green-600 border border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-600 border border-red-200";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // ฟังก์ชันแปลงวันที่แบบไทย
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading State
  if (loading) {
    return (
        <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Package className="text-blue-600" /> ประวัติการสั่งซื้อ
      </h1>

      {/* Empty State */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
            <AlertCircle size={48} className="mb-2 text-gray-400" />
            <p className="text-lg">ยังไม่มีประวัติการสั่งซื้อ</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={16} />
                    <span>วันที่สั่งซื้อ: {formatDate(item.createdAt)}</span>
                  </div>
                  
                  {item.orderedBy?.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="mt-0.5" />
                        <span>ที่อยู่จัดส่ง: {item.orderedBy.address}</span>
                    </div>
                  )}
                </div>

                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.orderStatus)}`}>
                    {item.orderStatus}
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-md border border-gray-200">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">สินค้า</th>
                      <th className="px-4 py-3 text-right">ราคา</th>
                      <th className="px-4 py-3 text-center">จำนวน</th>
                      <th className="px-4 py-3 text-right">รวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {item.products?.map((product, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">
                            {product.product.title}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                            {numberFormat(product.price)}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">
                            {product.count}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-800">
                          {numberFormat(product.count * product.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Footer */}
              <div className="flex justify-end items-center mt-4 pt-4 border-t border-gray-100">
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">ยอดรวมสุทธิ</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {numberFormat(item.cartTotal)} <span className="text-sm font-normal text-gray-500">บาท</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryCard;