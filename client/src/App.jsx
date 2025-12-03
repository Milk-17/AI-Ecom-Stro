// rafce
import React, { useEffect } from "react" // <--- 1. เพิ่ม useEffect
import AppRoutes from "./routes/AppRoutes"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// <--- 2. เพิ่ม Import ส่วนที่ต้องใช้เช็ค Token
import useEcomStore from "./store/ecom-store";
import { jwtDecode } from "jwt-decode";

const App = () => {
  //Javascript
  
  // <--- 3. ดึง Token และฟังก์ชัน Logout มาจาก Store
  const token = useEcomStore((state) => state.token);
  const clearStore = useEcomStore((state) => state.logout);

  // <--- 4. ใส่ Logic เช็ควันหมดอายุที่นี่
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          // ถ้าหมดอายุ -> สั่ง Logout ทันที
          clearStore(); 
          console.log("Token expired, Auto Logout");
        }
      } catch (error) {
        // ถ้า Token พังหรือแกะไม่ได้ -> สั่ง Logout กันเหนียว
        clearStore();
      }
    }
  }, [token, clearStore]);


  return (
    <>
    <ToastContainer />
      <AppRoutes/>
    </>

  )
}

export default App