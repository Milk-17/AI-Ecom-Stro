import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useEcomStore from "../../store/ecom-store"; // ถ้าใช้ Zustand เก็บ token
import axios from "axios";

const AdminLogsTable = () => {
  const token = useEcomStore((state) => state.token); 
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/product/admin/logs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLogs(res.data);
    } catch (err) {
      console.log(err);
      toast.error("ไม่สามารถโหลด Log Admin ได้");
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-md p-4">
      <h2 className="text-xl font-bold mb-4">Admin Logs</h2>
      <table className="min-w-full table-auto border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">ID</th>
            <th className="px-4 py-2 border">Admin</th>
            <th className="px-4 py-2 border">Action</th>
            <th className="px-4 py-2 border">Product</th>
            <th className="px-4 py-2 border">Message</th>
            <th className="px-4 py-2 border">Date</th>
            
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">{log.id}</td>
              <td className="px-4 py-2 border">{log.admin?.name || log.admin?.email}</td>
              <td className="px-4 py-2 border capitalize">{log.action}</td>
              <td className="px-4 py-2 border">{log.product?.title || "-"}</td>
              <td className="px-4 py-2 border">{log.message || "-"}</td>
              <td className="px-4 py-2 border">{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminLogsTable;