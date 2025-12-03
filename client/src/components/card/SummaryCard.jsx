import React, { useState, useEffect } from "react";
import { MapPin, ShoppingBag, Truck, CheckCircle, CreditCard } from "lucide-react";
import { listUserCart, saveAddress, saveOrder } from "../../api/user";
import useEcomStore from "../../store/ecom-store";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { numberFormat } from "../../utils/number";

const SummaryCard = () => {
  const token = useEcomStore((state) => state.token);
  const [products, setProducts] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  const [address, setAddress] = useState("");
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
      return toast.warning("กรุณากรอกที่อยู่");
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
      return toast.warning("กรุณากรอกที่อยู่ก่อนดำเนินการชำระเงิน");
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
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left: Address Form */}
        <div className="md:w-2/3 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
              <MapPin className="text-blue-600" /> ที่อยู่ในการจัดส่ง
            </h1>
            
            <div className="space-y-4">
                <div>
                    <textarea
                        required
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="บ้านเลขที่, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์..."
                        className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none text-gray-700"
                    />
                </div>
                
                <button
                    onClick={handleSaveAddress}
                    className={`px-6 py-2.5 rounded-md font-medium transition-all shadow-sm flex items-center gap-2
                        ${addressSaved 
                            ? "bg-green-100 text-green-700 cursor-default border border-green-200" 
                            : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                        }`}
                    disabled={addressSaved}
                >
                    {addressSaved ? (
                        <> <CheckCircle size={18}/> บันทึกที่อยู่แล้ว </>
                    ) : (
                        "บันทึกที่อยู่"
                    )}
                </button>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="md:w-1/3">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-4">
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                <ShoppingBag className="text-blue-600" /> สรุปคำสั่งซื้อ
            </h1>

            {/* Item List */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {products?.map((item, index) => (
                <div key={index} className="flex justify-between items-start text-sm border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex-1 pr-4">
                    <p className="font-semibold text-gray-800 line-clamp-2">{item.product.title}</p>
                    <p className="text-gray-500 mt-1">
                      {item.count} x {numberFormat(item.product.price)}
                    </p>
                  </div>
                  <div className="font-bold text-gray-800">
                    {numberFormat(item.count * item.product.price)}
                  </div>
                </div>
              ))}
            </div>

            <hr className="my-6 border-gray-200" />

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>ค่าจัดส่ง</span>
                <span className="font-medium text-gray-800">0.00</span>
              </div>
              <div className="flex justify-between">
                <span>ส่วนลด</span>
                <span className="font-medium text-gray-800">0.00</span>
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            <div className="flex justify-between items-end mb-6">
              <span className="text-lg font-bold text-gray-800">ยอดรวมสุทธิ</span>
              <span className="text-2xl font-bold text-blue-600">{numberFormat(cartTotal)}</span>
            </div>

            <button
              onClick={handleGoToPayment}
              disabled={!addressSaved}
              className={`w-full py-3 rounded-lg font-bold text-lg shadow-md transition-all flex justify-center items-center gap-2
                ${addressSaved 
                    ? "bg-green-500 hover:bg-green-600 text-white hover:shadow-lg transform active:scale-[0.98]" 
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              <CreditCard size={20} /> ชำระเงิน
            </button>
            
            {!addressSaved && (
                <p className="text-xs text-red-500 text-center mt-2">* กรุณาบันทึกที่อยู่ก่อนชำระเงิน</p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;