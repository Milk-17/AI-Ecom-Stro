// หน้า ResetPassword
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error("Passwords do not match");

    try {
      const res = await axios.post(`http://localhost:5001/api/auth/reset-password/${token}`, { password });
      toast.success(res.data.message || "Password reset successful");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Reset Password</h2>
        <input
          type="password"
          placeholder="New password"
          className="border px-3 py-2 w-full mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm password"
          className="border px-3 py-2 w-full mb-4 rounded"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <button className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;