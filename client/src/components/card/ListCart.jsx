import React from "react";
import { List } from "lucide-react";
import useEcomStroe from "../../store/ecom-store";
import { Link , useNavigate } from 'react-router-dom'
import { createUserCart } from "../../api/user";
import { toast } from 'react-toastify'



const ListCart = () => {
  const cart = useEcomStroe((state) => state.carts);
  const user = useEcomStroe ((s) => s.user)  
  const token = useEcomStroe((s) => s.token)
  const getTotalPrice = useEcomStroe ((state) => state.getTotalPrice);
  const navigate = useNavigate()
  const handleSaveCart = async () => {
    await createUserCart (token,{ cart })
    .then((res) => {
      console.log(res)
      toast.success ('บันทึกใส่ตะกร้าเรียบร้อยแล้ว',{
        position: "top-center"
      });
      navigate('/checkout')
    })
    .catch((err) => {
      console.log(err)
    })
  }

  //console.log('User--',user)
  return (
    <div className="bg-gray-200 rounded-t-md p-4">
      {/* Header */}
      <div className="flex gap-4 mb-4">
        <List size={36} />
        <p className="font-bold text-xl">รายการสินค้า {cart.length} รายการ</p>
      </div>
      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left */}
        <div className="col-span-2">
          {cart.map((item, index) => (
            <div key={index} className="bg-white p-2 rounded-md shadow-md mb-2">
              {/* Row 1 */}
              <div className="flex justify-between mb-2">
                {/* Row Left */}
                <div className="flex gap-2 items-center">
                  {item.images && item.images.length > 0 ? (
                    <img
                      className="w-16 h-16 rounded-md shadow-md"
                      src={item.images[0].url}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-300 rounded-md flex text-center items-center">
                      No Image
                      <img />
                    </div>
                  )}

                  <div>
                    <p className="font-bold">{item.title}</p>
                    <p className="text-sm">{item.price} X {item.count}</p>
                  </div>
                </div>
                {/* Row Rigt */}
                <div>
                  <div className="font-bold text-blue-600">{item.price * item.count}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rigth */}
        <div className="bg-white p-4 rounded-md shadow-md space-y-4">
            <p className="font-bold text-xl">
                ยอดรวม
            </p>
            <div className="flex justify-between">
                <span>
                    รวมสุทธิ
                </span>
                <span className="text-xl">
                    {getTotalPrice()}
                </span>
            </div>

        <div className="flex flex-col gap-2">
          {
            user
            ?          <Link>  
            <button 
            onClick={handleSaveCart}
            className="bg-red-500 w-full  rounded-md text-white py-2 shadow-md hover:bg-red-700">
              สั่งซื้อ
            </button>
           </Link> 
            :         <Link to = {'/Login'}>  
            <button className="bg-blue-500 w-full  rounded-md text-white py-2 shadow-md hover:bg-red-700">
              Login
            </button>
            </Link> 
          }



 

          <Link to = {'/shop'}>
          <button className="bg-gray-500 w-full rounded-md text-white py-2 shadow-md hover:bg-gray-700">
            แก้ไขรายการ
          </button>
          </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListCart;
