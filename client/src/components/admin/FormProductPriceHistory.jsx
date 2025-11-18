import React, { useEffect, useState } from "react";
import useEcomStore from "../../store/ecom-store";
import axios from "axios";
import { toast } from "react-toastify";

const FormProductPriceHistory = () => { // ❌ ไม่ต้องรับ productId
  const token = useEcomStore((state) => state.token);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5001/api/productpricehistory`, 
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setHistory(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Cannot fetch price history");
      }
    };

    fetchHistory();
  }, [token]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Product Price Log</h1>
      <div className="bg-white p-4 rounded shadow overflow-auto">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border p-2">#</th>
              <th className="border p-2">Product</th>
              <th className="border p-2">Old Price</th>
              <th className="border p-2">New Price</th>
              <th className="border p-2">Changed At</th>
              <th className="border p-2">Changed By</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, index) => (
              <tr key={h.id}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{h.product?.title || "Unknown"}</td>
                <td className="border p-2">{h.oldPrice}</td>
                <td className="border p-2">{h.newPrice}</td>
                <td className="border p-2">{new Date(h.changedAt).toLocaleString()}</td>
                <td className="border p-2">{h.changedBy?.email || "Unknown"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FormProductPriceHistory;
