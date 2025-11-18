import React, { useState, useEffect } from "react";
import { MapPinCheckInside } from 'lucide-react';
import { listUserCart, saveAddress, saveOrder } from "../../api/user";
import useEcomStore from '../../store/ecom-store';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

const SummaryCard = () => {
  const token = useEcomStore((state) => state.token);
  const [products, setProducts] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  const [address, setAddress] = useState('');
  const [addressSaved, setAddressSaved] = useState(false);
  const navigate = useNavigate();
  const clearCart = useEcomStore((state) => state.clearCart);

  useEffect(() => {
    handleGetUserCart(token);
  }, []);

  const handleGetUserCart = (token) => {
    listUserCart(token)
      .then((res) => {
        setProducts(res.data.products);
        setCartTotal(res.data.cartTotal);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSaveAddress = () => {
    if (!address) {
      return toast.warning('กรุณากรอกที่อยู่');
    }
    saveAddress(token, address)
      .then((res) => {
        toast.success(res.data.message);
        setAddressSaved(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleGoToPayment = () => {
    if (!addressSaved) {
      return toast.warning('กรุณากรอกที่อยู่ก่อนดำเนินการชำระเงิน');
    }
    // ส่ง order ไป backend
    saveOrder(token, {}) // payload ว่างเพราะ backend เอา cart จาก DB
      .then((res) => {
        toast.success(res.data.message || "Order placed successfully");
        clearCart(); // เคลียร์ cart frontend
        navigate("/user/history"); // ไปหน้า history
      })
      .catch((err) => {
        console.log(err);
        toast.error("Payment failed!");
      });
  };

  return (
    <div className="mx-auto">
      <div className="flex gap-4">
        {/* Left */}
        <div className="w-2/4">
          <div className="bg-gray-100 p-4 rounded-md border shadow-md space-y-3">
            <div className="flex">
              <MapPinCheckInside />
              <h1 className="font-bold text-lg px-2">ที่อยู่ในการจัดส่ง</h1>
            </div>
            <textarea
              required
              onChange={(e) => setAddress(e.target.value)}
              placeholder="กรุณากรอกที่อยู่จัดส่ง"
              className="w-full px-2 rounded-md"
            />
            <button
              onClick={handleSaveAddress}
              className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-800 hover:scale-105 hover:translate-y-1 hover:duration-200"
            >
              Save Address
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="w-2/4">
          <div className="bg-gray-100 p-4 rounded-md border shadow-md space-y-4">
            <h1 className="font-bold text-lg">คำสั่งซื้อของคุณ</h1>
            {/* Item List */}
            {products?.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="font-bold">{item.product.title}</p>
                    <p className="text-sm">จำนวน : {item.count} X {item.product.price}</p>
                  </div>
                  <div>
                    <p className="text-red-500 font-bold">{item.count * item.product.price}</p>
                  </div>
                </div>
              </div>
            ))}

            <hr />

            <div>
              <div className="flex justify-between">
                <p>ค่าจัดส่ง : </p>
                <p>0.00</p>
              </div>
              <div className="flex justify-between">
                <p>ส่วนลด : </p>
                <p>0.00</p>
              </div>
            </div>

            <hr />

            <div>
              <div className="flex justify-between">
                <p className="font-bold text-lg ">ยอดรวมสุทธิ  </p>
                <p className="text-red-500 font-bold text-lg">{cartTotal}</p>
              </div>
            </div>

            <hr />

            <div>
              <button
                onClick={handleGoToPayment}
                className="bg-green-500 rounded-md w-full p-2 shadow-md text-white hover:bg-green-700 hover:scale-105 hover:translate-y-1 hover:duration-200"
              >
                ดำเนินการชำระเงิน
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
