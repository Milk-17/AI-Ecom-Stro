import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useEcomStore from "../../store/ecom-store";
import axios from "axios";
import { Loader, User, ClipboardList } from "lucide-react"; // เพิ่ม Icons

const AdminLogsTable = () => {
  const token = useEcomStore((state) => state.token);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false); // 1. เพิ่ม Loading

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // แนะนำ: ควรย้าย URL ไปไว้ในไฟล์ api/admin.js ในอนาคต
      const res = await axios.get("http://localhost:5001/api/product/admin/logs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLogs(res.data);
    } catch (err) {
      console.log(err);
      toast.error("ไม่สามารถโหลด Log Admin ได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // 2. ฟังก์ชันเลือกสีตาม Action
  const getActionStyle = (action) => {
    switch (action.toLowerCase()) {
      case "create":
        return "bg-green-100 text-green-700 border-green-200";
      case "delete":
        return "bg-red-100 text-red-700 border-red-200";
      case "update":
      case "edit":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "login":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // 3. ฟังก์ชันจัดรูปแบบวันที่
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
    return (
      <div className="flex justify-center items-center h-48 bg-white shadow-md rounded-md p-4">
        <Loader className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-md p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b">
        <ClipboardList className="text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">Admin Activity Logs</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="px-4 py-3 border-b">Date</th>
              <th className="px-4 py-3 border-b">Admin</th>
              <th className="px-4 py-3 border-b text-center">Action</th>
              <th className="px-4 py-3 border-b">Product</th>
              <th className="px-4 py-3 border-b">Message</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-600">
            {logs.length === 0 ? (
                <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-400">ไม่มีประวัติการใช้งาน</td>
                </tr>
            ) : (
                logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    {/* Date */}
                    <td className="px-4 py-3 border-b whitespace-nowrap text-xs">
                        {formatDate(log.createdAt)}
                    </td>
                    
                    {/* Admin */}
                    <td className="px-4 py-3 border-b">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-100 p-1 rounded-full text-blue-600">
                                <User size={14} />
                            </div>
                            <span className="font-medium text-gray-800">
                                {log.admin?.name || log.admin?.email || "Unknown"}
                            </span>
                        </div>
                    </td>

                    {/* Action Badge */}
                    <td className="px-4 py-3 border-b text-center">
                    <span
                        className={`px-2 py-1 rounded-md text-xs font-bold border capitalize ${getActionStyle(
                        log.action
                        )}`}
                    >
                        {log.action}
                    </span>
                    </td>

                    {/* Product */}
                    <td className="px-4 py-3 border-b font-medium text-gray-700">
                    {log.product?.title ? (
                        <span className="truncate block max-w-[150px]" title={log.product.title}>
                            {log.product.title}
                        </span>
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                    </td>

                    {/* Message */}
                    <td className="px-4 py-3 border-b text-gray-500 max-w-xs truncate" title={log.message}>
                        {log.message || "-"}
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLogsTable;