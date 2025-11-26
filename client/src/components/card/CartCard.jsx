import React, { useState } from "react";
import { Trash2, Minus, Plus, List, Loader } from "lucide-react"; // รวม Icon ทั้งหมด
import useEcomStore from "../../store/ecom-store";
import { Link, useNavigate } from "react-router-dom";
import { createUserCart } from "../../api/user";
import { toast } from "react-toastify";
import { numberFormat } from '../../utils/number'; // ใช้ utils เดิมของคุณ หรือจะใช้ฟังก์ชัน formatNumber ข้างล่างก็ได้

const CartCard = () => {
  // --- PART 1: LOGIC (จาก Code 2) ---
  const carts = useEcomStore((state) => state.carts);
  const user = useEcomStore((state) => state.user);
  const token = useEcomStore((state) => state.token);
  const actionUpdateQuantity = useEcomStore((state) => state.actionUpdateQuantity);
  const actionRemoveProduct = useEcomStore((state) => state.actionRemoveProduct);
  const getTotalPrice = useEcomStore((state) => state.getTotalPrice);

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // ฟังก์ชันบันทึกตะกร้า (จาก Code 2)
  const handleSaveCart = async () => {
    if (carts.length === 0) {
      toast.warning("กรุณาเลือกสินค้าลงตะกร้า");
      return;
    }

    setIsLoading(true);
    try {
      await createUserCart(token, { cart: carts });
      toast.success("บันทึกใส่ตะกร้าเรียบร้อยแล้ว");
      navigate("/checkout");
    } catch (err) {
      console.log(err);
      toast.error("เกิดข้อผิดพลาดในการบันทึกตะกร้า");
    } finally {
      setIsLoading(false);
    }
  };

  // --- PART 2: UI (หน้าตาจาก Code 1) ---
  return (
    <div>
      <h1 className="text-2xl font-bold flex gap-2 items-center">
        <List /> ตะกร้าสินค้า
      </h1>
      
      {/* Border */}
      <div className="border p-2 mt-4">
        
        {/* Card Loop */}
        {carts.map((item, index) => (
          <div key={index} className="bg-white p-2 rounded-md shadow-md mb-2">
            
            {/* Row 1: Image, Title, Delete */}
            <div className="flex justify-between mb-2">
              {/* Left */}
              <div className="flex gap-2 items-center">
                {item.images && item.images.length > 0 ? (
                  <img
                    className="w-16 h-16 rounded-md object-cover"
                    src={item.images[0].url}
                    alt={item.title}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex text-center items-center justify-center text-xs">
                    No Image
                  </div>
                )}

                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>

              {/* Right: Trash Button (เอาของ Code 1 มาใช้) */}
              <div
                onClick={() => actionRemoveProduct(item.id)}
                className="text-red-600 p-2 cursor-pointer hover:bg-red-100 rounded-full"
              >
                <Trash2 />
              </div>
            </div>

            {/* Row 2: Quantity & Price */}
            <div className="flex justify-between items-center">
              {/* Left: Plus/Minus Buttons (เอาของ Code 1 มาใช้) */}
              <div className="border rounded-sm px-2 py-1 flex items-center">
                <button
                  onClick={() => actionUpdateQuantity(item.id, item.count - 1)}
                  className="px-2 py-1 bg-gray-200 rounded-sm hover:bg-gray-400 disabled:opacity-50"
                  disabled={item.count <= 1}
                >
                  <Minus size={16} />
                </button>

                <span className="px-4 font-bold">{item.count}</span>

                <button
                  onClick={() => actionUpdateQuantity(item.id, item.count + 1)}
                  className="px-2 py-1 bg-gray-200 rounded-sm hover:bg-gray-400"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Right: Total Price */}
              <div className="font-bold text-blue-500">
                {numberFormat(item.price * item.count)}
              </div>
            </div>
          </div>
        ))}

        {/* Total Summary */}
        <div className="flex justify-between px-2 mt-4 border-t pt-4">
          <span className="font-bold text-lg">รวมทั้งสิ้น</span>
          <span className="font-bold text-xl">{numberFormat(getTotalPrice())}</span>
        </div>

        {/* Action Button (ใช้ Logic ของ Code 2 แต่หน้าตาคล้าย Code 1) */}
        {user ? (
          <button
            disabled={isLoading || carts.length === 0}
            onClick={handleSaveCart}
            className={`mt-4 w-full py-2 rounded-md shadow-md text-white flex justify-center items-center gap-2 ${
                isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-700'
            }`}
          >
            {isLoading && <Loader className="animate-spin" size={16} />}
            ดำเนินการชำระเงิน
          </button>
        ) : (
          <Link to="/login">
            <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white w-full py-2 rounded-md shadow-md">
              Login เพื่อดำเนินการต่อ
            </button>
          </Link>
        )}

      </div>
    </div>
  );
};

export default CartCard;