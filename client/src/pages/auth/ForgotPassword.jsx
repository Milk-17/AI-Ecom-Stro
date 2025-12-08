// หน้า ForgotPassword
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5001/api/auth/forgot-password", { email });
      toast.success(res.data.message || "Reset link sent to your email!");
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
          type="email"
          placeholder="Enter your email"
          className="border px-3 py-2 w-full mb-4 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Send Reset Link
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;