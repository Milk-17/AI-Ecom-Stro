import React, { useState, useEffect } from "react";
import { listUserCart, saveOrder, saveAddress, getAddress } from "../../api/user"; // import API ใหม่
import useEcomStore from "../../store/ecom-store";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { numberFormat } from "../../utils/number";
import { MapPin, ShoppingBag, CreditCard, Plus, Home, Phone, User, Trash2 } from "lucide-react";

const SummaryCard = () => {
  const token = useEcomStore((state) => state.token);
  const [products, setProducts] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  // Address State
  const [addresses, setAddresses] = useState([]); // รายการที่อยู่ทั้งหมด
  const [selectedAddressId, setSelectedAddressId] = useState(null); // ID ที่อยู่ที่เลือก
  const [showAddressForm, setShowAddressForm] = useState(false); // เปิด/ปิด ฟอร์มเพิ่มที่อยู่

  // Form State
  const [addressForm, setAddressForm] = useState({
      recipient: "",
      phone: "",
      addrDetail: "",
      province: "",
      district: "",
      subDistrict: "",
      zipcode: ""
  });

  const navigate = useNavigate();
  const clearCart = useEcomStore((state) => state.clearCart);

  useEffect(() => {
    handleGetUserCart(token);
    handleGetAddress(token); // ดึงที่อยู่มาแสดง
  }, []);

  const handleGetUserCart = (token) => {
    listUserCart(token)
      .then((res) => {
        setProducts(res.data.products);
        setCartTotal(res.data.cartTotal);
      })
      .catch((err) => console.log(err));
  };

  const handleGetAddress = (token) => {
      getAddress(token)
        .then((res) => {
            setAddresses(res.data);
            // ถ้ามีที่อยู่ และยังไม่ได้เลือก ให้เลือกอันแรกเป็น default (หรือเลือก isMain)
            if (res.data.length > 0 && !selectedAddressId) {
                const mainAddr = res.data.find(addr => addr.isMain) || res.data[0];
                setSelectedAddressId(mainAddr.id);
            }
        })
        .catch((err) => console.log(err));
  }

  const handleCreateAddress = () => {
    // Validate Form
    if(!addressForm.recipient || !addressForm.phone || !addressForm.addrDetail || !addressForm.province) {
        return toast.warning("กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    saveAddress(token, addressForm)
      .then((res) => {
        toast.success(res.data.message);
        handleGetAddress(token); // โหลดรายการใหม่
        setShowAddressForm(false); // ปิดฟอร์ม
        setAddressForm({ // เคลียร์ฟอร์ม
            recipient: "", phone: "", addrDetail: "",
            province: "", district: "", subDistrict: "", zipcode: ""
        });
      })
      .catch((err) => console.log(err));
  };

  const handleChangeForm = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
        // ถ้าเป็นช่อง phone: ลบทุกตัวอักษรที่ไม่ใช่ตัวเลขออกทันที (Regular Expression)
        const numericValue = value.replace(/\D/g, ""); 
        setAddressForm({
            ...addressForm,
            [name]: numericValue
        });
    } else {
        // ช่องอื่นๆ พิมพ์ได้ปกติ
        setAddressForm({
            ...addressForm,
            [name]: value
        });
    }
}

  const handleGoToPayment = () => {
    if (!selectedAddressId) {
      return toast.warning("กรุณาเลือกที่อยู่จัดส่ง");
    }
    
    // ส่ง addressId ไป backend
    saveOrder(token, { addressId: selectedAddressId }) 
      .then((res) => {
        toast.success(res.data.message || "Order placed successfully");
        clearCart(); 
        navigate("/user/history");
      })
      .catch((err) => {
        console.log(err);
        const errMsg = err.response?.data?.message || "Payment failed!";
        toast.error(errMsg);
      });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* --- Left: Address Selection --- */}
        <div className="md:w-2/3 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
              <MapPin className="text-blue-600" /> ที่อยู่ในการจัดส่ง
            </h1>

            {/* Address List */}
            <div className="space-y-4 mb-6">
                {addresses.length === 0 && !showAddressForm && (
                    <div className="text-center p-8 bg-gray-50 border border-dashed rounded-lg text-gray-500">
                        ยังไม่มีที่อยู่จัดส่ง กรุณาเพิ่มที่อยู่ใหม่
                    </div>
                )}

                {addresses.map((addr, index) => (
                    <div 
                        key={index}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all relative flex flex-col gap-2
                            ${selectedAddressId === addr.id 
                                ? "border-blue-500 bg-blue-50" 
                                : "border-gray-200 hover:border-blue-300"
                            }`}
                    >
                        <div className="flex items-center gap-2 font-bold text-gray-800">
                            <User size={16} /> {addr.recipient} 
                            <span className="text-gray-500 font-normal text-sm flex items-center gap-1 ml-2">
                                <Phone size={14} /> {addr.phone}
                            </span>
                        </div>
                        <div className="text-sm text-gray-600 leading-relaxed">
                            {addr.addrDetail} <br/>
                            {addr.subDistrict} {addr.district} {addr.province} {addr.zipcode}
                        </div>

                        {/* Radio Check Icon */}
                        <div className={`absolute top-4 right-4 h-5 w-5 rounded-full border flex items-center justify-center
                            ${selectedAddressId === addr.id ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
                            {selectedAddressId === addr.id && <div className="h-2 w-2 bg-white rounded-full"></div>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add New Address Button */}
            {!showAddressForm ? (
                <button 
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center justify-center gap-2 w-full py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                    <Plus size={20} /> เพิ่มที่อยู่ใหม่
                </button>
            ) : (
                // --- Add Address Form ---
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                    <h3 className="font-bold text-gray-700 mb-2">เพิ่มที่อยู่ใหม่</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="recipient" onChange={handleChangeForm} value={addressForm.recipient} placeholder="ชื่อ-นามสกุล ผู้รับ" className="p-2 border rounded-md w-full" />
                        <input name="phone" onChange={handleChangeForm} value={addressForm.phone} placeholder="เบอร์โทรศัพท์" className="p-2 border rounded-md w-full" />
                    </div>
                    
                    <textarea name="addrDetail" onChange={handleChangeForm} value={addressForm.addrDetail} placeholder="ที่อยู่ (บ้านเลขที่, หมู่, ซอย, ถนน)" className="p-2 border rounded-md w-full resize-none h-20" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="subDistrict" onChange={handleChangeForm} value={addressForm.subDistrict} placeholder="ตำบล/แขวง" className="p-2 border rounded-md w-full" />
                        <input name="district" onChange={handleChangeForm} value={addressForm.district} placeholder="อำเภอ/เขต" className="p-2 border rounded-md w-full" />
                        <input name="province" onChange={handleChangeForm} value={addressForm.province} placeholder="จังหวัด" className="p-2 border rounded-md w-full" />
                        <input name="zipcode" onChange={handleChangeForm} value={addressForm.zipcode} placeholder="รหัสไปรษณีย์" className="p-2 border rounded-md w-full" />
                    </div>

                    <div className="flex gap-2 justify-end mt-4">
                        <button onClick={() => setShowAddressForm(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">ยกเลิก</button>
                        <button onClick={handleCreateAddress} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">บันทึกที่อยู่</button>
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* --- Right: Order Summary --- */}
        <div className="md:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                <ShoppingBag className="text-blue-600" /> สรุปคำสั่งซื้อ
            </h1>

            {/* Item List */}
            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
              {products?.map((item, index) => (
                <div key={index} className="flex justify-between items-start text-sm border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex-1 pr-4">
                    <p className="font-semibold text-gray-800 line-clamp-2">{item.product.title}</p>
                    <p className="text-gray-500 mt-1">
                      {item.count} x {numberFormat(item.product.price)}
                    </p>
                  </div>
                  <div className="font-bold text-gray-800 whitespace-nowrap">
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
              disabled={!selectedAddressId} // ต้องเลือกที่อยู่ก่อนถึงจะกดได้
              className={`w-full py-3.5 rounded-lg font-bold text-lg shadow-md transition-all flex justify-center items-center gap-2
                ${selectedAddressId 
                    ? "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform active:scale-[0.98]" 
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              <CreditCard size={20} /> ชำระเงิน
            </button>
            
            {!selectedAddressId && (
                <p className="text-xs text-red-500 text-center mt-3 animate-pulse">* กรุณาเลือกที่อยู่จัดส่งก่อนชำระเงิน</p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;