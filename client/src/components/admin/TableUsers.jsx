import React, { useState, useEffect } from "react";
import { getListAllUsers, changeUserStatus, changeUserRole } from "../../api/admin";
import useEcomStore from "../../store/ecom-store";
import { toast } from "react-toastify";
import { Shield, User, CheckCircle, XCircle, Loader } from "lucide-react"; // เพิ่ม Icons

const TableUsers = () => {
  const token = useEcomStore((state) => state.token);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false); // เพิ่ม Loading State

  useEffect(() => {
    handleGetUsers(token);
  }, []);

  const handleGetUsers = (token) => {
    setLoading(true);
    getListAllUsers(token)
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  };

  const handleChangeUserStatus = (userId, userStatus) => {
    const value = {
      id: userId,
      enabled: !userStatus,
    };
    changeUserStatus(token, value)
      .then((res) => {
        handleGetUsers(token);
        toast.success("Update Status Success!!");
      })
      .catch((err) => {
        console.log(err);
        toast.error("Update Status Failed");
      });
  };

  const handleChangeUserRole = (userId, userRole) => {
    const value = {
      id: userId,
      role: userRole,
    };
    changeUserRole(token, value)
      .then((res) => {
        handleGetUsers(token);
        toast.success("Update Role Success!!");
      })
      .catch((err) => {
        console.log(err);
        toast.error("Update Role Failed");
      });
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
    return (
        <div className="flex justify-center items-center h-96">
            <Loader className="animate-spin text-blue-600" size={48} />
        </div>
    )
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <User className="text-blue-600" /> จัดการผู้ใช้งาน
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
            <tr>
              <th className="p-3 border-b text-center w-16">ลำดับ</th>
              <th className="p-3 border-b">Email</th>
              <th className="p-3 border-b text-center">สิทธิ์ (Role)</th>
              <th className="p-3 border-b text-center">สถานะ</th>
              <th className="p-3 border-b text-center">จัดการ</th>
              <th className="p-3 border-b text-right text-gray-500 text-xs">อัพเดทล่าสุด</th>
            </tr>
          </thead>

          <tbody className="text-gray-600 text-sm">
            {users?.map((el, i) => (
              <tr key={el.id} className="border-b hover:bg-gray-50 transition duration-150">
                <td className="p-3 text-center">{i + 1}</td>
                <td className="p-3 font-medium text-gray-800">{el.email}</td>

                {/* Role Dropdown */}
                <td className="p-3 text-center">
                  <select
                    onChange={(e) => handleChangeUserRole(el.id, e.target.value)}
                    value={el.role}
                    className={`border p-1 rounded-md outline-none text-sm font-medium cursor-pointer shadow-sm
                        ${el.role === 'admin' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700'}
                    `}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                {/* Status Badge */}
                <td className="p-3 text-center">
                  {el.enabled ? (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                      <CheckCircle size={12} /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                      <XCircle size={12} /> Inactive
                    </span>
                  )}
                </td>

                {/* Action Button */}
                <td className="p-3 text-center">
                  <button
                    className={`px-3 py-1 rounded-md text-white shadow-md transition-all duration-200 text-xs font-bold
                        ${el.enabled 
                            ? "bg-red-500 hover:bg-red-600" // ถ้าเปิดอยู่ ปุ่มจะเป็นสีแดง (เพื่อให้กดปิด)
                            : "bg-green-500 hover:bg-green-600" // ถ้าปิดอยู่ ปุ่มจะเป็นสีเขียว (เพื่อให้กดเปิด)
                        }
                    `}
                    onClick={() => handleChangeUserStatus(el.id, el.enabled)}
                  >
                    {el.enabled ? "Disable" : "Activate"}
                  </button>
                </td>

                {/* Updated At */}
                <td className="p-3 text-right text-xs text-gray-400">
                    {formatDate(el.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableUsers;