import React, { useEffect, useState } from "react";
import { getOrdersAdmin, changeOrderStatus } from "../../api/admin";
import useEcomStore from "../../store/ecom-store";
import { toast } from "react-toastify";
import { numberFormat } from "../../utils/number";
import { Loader, Package, Save } from "lucide-react"; // เพิ่ม Icons

const TableOrders = () => {
  const token = useEcomStore((state) => state.token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // *** 1. State เก็บเลขพัสดุชั่วคราว (Key = orderId, Value = trackingNumber) ***
  const [trackingInputs, setTrackingInputs] = useState({});

  useEffect(() => {
    handleGetOrder(token);
  }, []);

  const handleGetOrder = (token) => {
    setLoading(true);
    getOrdersAdmin(token)
      .then((res) => {
        // เรียง order ใหม่ล่าสุดขึ้นบน
        const sortedOrders = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setLoading(false));
  };

  const handleChangeOrderStatus = (token, orderId, orderStatus) => {
    // *** 2. ดึงเลขพัสดุที่ Admin กรอกไว้ (ถ้ามี) ***
    // ถ้าไม่มีใน input ให้ใช้ค่าเดิมที่มีอยู่แล้ว หรือส่ง "" ไป
    const trackingNumber = trackingInputs[orderId] || "";

    changeOrderStatus(token, orderId, orderStatus, trackingNumber) // <-- ส่ง trackingNumber ไปด้วย
      .then((res) => {
        toast.success("อัปเดตสถานะและเลขพัสดุเรียบร้อย!");
        handleGetOrder(token); // โหลดข้อมูลใหม่
        
        // ล้างค่า input ของ order นั้นๆ (เพราะข้อมูลไปอยู่ใน DB แล้ว)
        setTrackingInputs(prev => {
            const newState = { ...prev };
            delete newState[orderId];
            return newState;
        });
      })
      .catch((err) => {
        console.log(err);
        toast.error("เกิดข้อผิดพลาดในการอัปเดต");
      });
  };

  // *** 3. ฟังก์ชันจัดการการพิมพ์เลขพัสดุ ***
  const handleTrackingChange = (e, orderId) => {
    setTrackingInputs({
        ...trackingInputs,
        [orderId]: e.target.value
    });
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Not Process":
        return "bg-gray-100 text-gray-600 border-gray-200";
      case "Processing":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "Completed":
        return "bg-green-100 text-green-600 border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-600 border-red-200";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // ฟังก์ชันจัดรูปแบบวันที่
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
  };

  if (loading) {
      return <div className="flex justify-center items-center h-96"><Loader className="animate-spin text-blue-600" size={48}/></div>
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <Package className="text-blue-600" /> จัดการคำสั่งซื้อ (Order Management)
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
            <tr>
              <th className="p-3 border-b text-center">ลำดับ</th>
              <th className="p-3 border-b">ผู้ใช้งาน</th>
              <th className="p-3 border-b text-center">วันที่</th>
              <th className="p-3 border-b">สินค้า</th>
              <th className="p-3 border-b text-right">ยอดรวม</th>
              
              {/* *** เพิ่มหัวตารางเลขพัสดุ *** */}
              <th className="p-3 border-b text-center">เลขพัสดุ</th> 
              
              <th className="p-3 border-b text-center">สถานะ</th>
              <th className="p-3 border-b text-center">จัดการ</th>
            </tr>
          </thead>

          <tbody className="text-sm text-gray-600">
            {orders?.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50 transition duration-150">
                <td className="p-3 text-center">{index + 1}</td>
                <td className="p-3">
                  <div className="font-bold text-gray-800">{item.orderedBy.email}</div>
                  <div className="text-xs text-gray-500 max-w-[200px] truncate" title={item.orderedBy.address}>
                    {item.orderedBy.address}
                  </div>
                </td>
                <td className="p-3 text-center text-xs whitespace-nowrap">
                    {formatDate(item.createdAt)}
                </td>
                <td className="p-3">
                  <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                    {item.products?.map((product, idx) => (
                      <li key={idx}>
                        <span className="font-medium">{product.product.title}</span> 
                        <span className="text-gray-500"> ({product.count} x {numberFormat(product.product.price)})</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-3 text-right font-bold text-blue-600 whitespace-nowrap">
                    {numberFormat(item.cartTotal)}
                </td>

                {/* *** เพิ่มช่องกรอกเลขพัสดุ *** */}
                <td className="p-3 text-center">
                    {/* ถ้ามีเลขพัสดุแล้ว ให้โชว์เป็น Text (หรือจะให้แก้ได้ก็ได้ครับ โดยเอา !item.trackingNumber ออก) */}
                    {item.trackingNumber ? (
                        <span className="text-gray-800 font-mono text-xs bg-gray-100 px-2 py-1 rounded border">
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
                {/* ******************************* */}

                <td className="p-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${getStatusColor(item.orderStatus)}`}>
                    {item.orderStatus}
                  </span>
                </td>
                
                <td className="p-3 text-center">
                  <select
                    value={item.orderStatus}
                    // เมื่อกดเปลี่ยนสถานะ จะส่ง trackingNumber ที่พิมพ์ไว้ไปด้วย
                    onChange={(e) => handleChangeOrderStatus(token, item.id, e.target.value)}
                    className="border border-gray-300 bg-white text-gray-700 text-xs rounded-md p-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Not Process">ยังไม่ดำเนินการ</option>
                    <option value="Processing">กำลังดำเนินการ</option>
                    <option value="Completed">เสร็จสิ้น (จัดส่งแล้ว)</option>
                    <option value="Cancelled">ยกเลิกรายการ</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableOrders;