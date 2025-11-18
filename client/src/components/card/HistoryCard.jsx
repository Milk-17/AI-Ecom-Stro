// rafce

import React, { useState, useEffect } from "react";
import { getOrders } from "../../api/user";
import useEcomStore from "../../store/ecom-store";
import { dateFormat } from "../../utils/deteformat";
import { numberFormat } from "../../utils/number";
import { toast } from "react-toastify"; // เพิ่ม import toast

const HistoryCard = () => {
  const token = useEcomStore((state) => state.token);
  // console.log(token);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // code
    hdlGetOrders(token);
  }, []);

  // ฟังก์ชันดึง order จาก backend
  const hdlGetOrders = async (token) => {
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
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Not Process":
        return "bg-gray-200";
      case "Processing":
        return "bg-blue-200";
      case "Completed":
        return "bg-green-200";
      case "Cancelled":
        return "bg-red-200";
    }
  };

 
return (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-800">ประวัติการสั่งซื้อ</h1>

    <div className="space-y-6">
      {orders?.map((item, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">วันที่สั่งซื้อ</p>
              <p className="font-semibold text-gray-800">{dateFormat(item.updatedAt)}</p>
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-semibold">ที่อยู่จัดส่ง: </span>
                {item.orderedBy?.address || "-"}
              </p>
            </div>
            <div>
              <span
                className={`${getStatusColor(item.orderStatus)} px-3 py-1 rounded-full text-sm font-medium`}
              >
                {item.orderStatus}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-4 py-2 text-left">สินค้า</th>
                  <th className="px-4 py-2 text-right">ราคา</th>
                  <th className="px-4 py-2 text-center">จำนวน</th>
                  <th className="px-4 py-2 text-right">รวม</th>
                </tr>
              </thead>
              <tbody>
                {item.products?.map((product, index) => (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="px-4 py-2">{product.product.title}</td>
                    <td className="px-4 py-2 text-right">{numberFormat(product.product.price)}</td>
                    <td className="px-4 py-2 text-center">{product.count}</td>
                    <td className="px-4 py-2 text-right">
                      {numberFormat(product.count * product.product.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="text-right mt-4">
            <p className="text-sm text-gray-500">ราคาสุทธิ</p>
            <p className="text-xl font-bold text-gray-800">{numberFormat(item.cartTotal)}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

};

export default HistoryCard;
