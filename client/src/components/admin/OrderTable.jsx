import React from "react";
import { numberFormat } from "../../utils/number";
import { Loader, MapPin } from "lucide-react";

const OrderTable = ({
  orders,
  trackingInputs,
  handleTrackingChange,
  handleChangeOrderStatus,
  loading,
  token // รับ token เข้ามาเพื่อใช้ส่ง API
}) => {
    
  // Standard: แยกฟังก์ชัน Helper สำหรับสีสถานะ
  const getStatusColor = (status) => {
    switch (status) {
      case "Not Process": return "bg-gray-100 text-gray-600 border-gray-200";
      case "Processing": return "bg-blue-100 text-blue-600 border-blue-200";
      case "Completed": return "bg-green-100 text-green-600 border-green-200";
      case "Cancelled": return "bg-red-100 text-red-600 border-red-200";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96"><Loader className="animate-spin text-blue-600" size={48}/></div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
          <tr>
            <th className="p-3 border-b text-center">ลำดับ</th>
            <th className="p-3 border-b">ผู้ใช้งาน</th>
            <th className="p-3 border-b text-center">วันที่</th>
            <th className="p-3 border-b">สินค้า</th>
            <th className="p-3 border-b text-right">ยอดรวม</th>
            <th className="p-3 border-b text-center">เลขพัสดุ</th>
            <th className="p-3 border-b text-center">สถานะ</th>
            <th className="p-3 border-b text-center">จัดการ</th>
          </tr>
        </thead>

        <tbody className="text-sm text-gray-600">
          {orders.length > 0 ? (
            orders.map((item, index) => (
              <tr key={item.id || index} className="border-b hover:bg-gray-50 transition duration-150">
                <td className="p-3 text-center">{index + 1}</td>
                
                <td className="p-3">
                  {/* Security: ใช้ Optional Chaining (?) ป้องกัน Error กรณี user ถูกลบ */}
                  <div className="font-bold text-gray-800">{item.orderedBy?.email || 'Guest / Deleted User'}</div>
                  
                  {/* Correctness: แสดงที่อยู่จาก Snapshot (shippingAddress) ก่อนเสมอ */}
                  <div className="text-xs text-gray-500 mt-1 max-w-[220px] truncate flex items-center gap-1" 
                       title={item.shippingAddress || item.orderedBy?.address}>
                    <MapPin size={12} className="flex-shrink-0"/>
                    {item.shippingAddress || item.orderedBy?.address || '-'}
                  </div>
                </td>

                <td className="p-3 text-center text-xs whitespace-nowrap">
                  {formatDate(item.createdAt)}
                </td>

                <td className="p-3">
                  <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                    {item.products?.map((product, idx) => (
                      <li key={idx}>
                        <span className="font-medium">{product.product?.title}</span>
                        <span className="text-gray-500"> ({product.count} x {numberFormat(product.price)})</span>
                      </li>
                    ))}
                  </ul>
                </td>

                <td className="p-3 text-right font-bold text-blue-600 whitespace-nowrap">
                  {numberFormat(item.cartTotal)}
                </td>

                <td className="p-3 text-center">
                  {item.trackingNumber ? (
                    <span className="text-gray-800 font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200">
                      {item.trackingNumber}
                    </span>
                  ) : (
                    <input
                      className="border border-gray-300 rounded-md p-1.5 text-xs w-28 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ระบุเลขพัสดุ"
                      onChange={(e) => handleTrackingChange(e, item.id)}
                      value={trackingInputs[item.id] || ""}
                    />
                  )}
                </td>

                <td className="p-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${getStatusColor(item.orderStatus)}`}>
                    {item.orderStatus}
                  </span>
                </td>

                <td className="p-3 text-center">
                  <select
                    value={item.orderStatus}
                    onChange={(e) => handleChangeOrderStatus(token, item.id, e.target.value)}
                    className="border border-gray-300 bg-white text-gray-700 text-xs rounded-md p-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Not Process">รอตรวจสอบ</option>
                    <option value="Processing">กำลังดำเนินการ</option>
                    <option value="Completed">จัดส่งสำเร็จ</option>
                    <option value="Cancelled">ยกเลิก</option>
                  </select>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="p-8 text-center text-gray-400 bg-gray-50">
                ไม่มีรายการคำสั่งซื้อในสถานะนี้
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;