import React from "react";
import { Outlet } from "react-router-dom";
import MainNav from "../components/MainNav";
import ChatbotWidget from "../components/ChatbotWidget"; // ✅ import เข้ามาด้วย

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <MainNav />
      
      <main className="h-full px-4 mt-2 mx-auto flex-1 w-full max-w-6xl pb-6">
        <Outlet />
      </main>

      {/* ปุ่ม + กล่องแชท ลอยมุมขวาล่าง */}
      <ChatbotWidget />
    </div>
  );
};

export default Layout;