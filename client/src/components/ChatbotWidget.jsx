// src/components/ChatbotWidget.jsx
import React, { useState, useEffect, useRef } from "react";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "สวัสดีครับ มีอะไรให้ช่วยไหมครับ? สอบถามเรื่องสเปคคอมได้เลย" },
  ]);
  const [isSending, setIsSending] = useState(false);

  // ใช้เก็บ Session ID
  const sessionIdRef = useRef("");

  // ใช้สำหรับเลื่อน scroll ไปด้านล่างสุด
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const newSessionId = `session-${Math.random().toString(36).substring(2, 9)}`;
    sessionIdRef.current = newSessionId;
    console.log("Chat Session ID:", newSessionId);
  }, []);

  // ✅ ทุกครั้งที่ messages เปลี่ยน ให้เลื่อนลงล่างสุด
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const N8N_WEBHOOK_URL = "https://balmlike-unblinking-arie.ngrok-free.dev/webhook/chat";

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userText = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    setIsSending(true);

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userText,
          sessionId: sessionIdRef.current,
        }),
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await res.json();

      const botText =
        data.answer ||
        data.output ||
        data.text ||
        "ขอโทษครับ ระบบไม่ได้รับคำตอบจาก AI";

      setMessages((prev) => [...prev, { from: "bot", text: botText }]);
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="
            fixed bottom-24 right-4 
            w-[420px] max-w-[95vw]
            max-h-[70vh]
            bg-white shadow-2xl rounded-2xl 
            border border-gray-200 
            flex flex-col overflow-hidden z-40
          "
        >
          {/* Header */}
          <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">
                Chatbot ช่วยจัดสเปคคอม
              </div>
              <div className="text-xs text-indigo-100">
                {isSending ? "กำลังพิมพ์..." : "ออนไลน์"}
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-white/80 hover:text-white text-xl leading-none"
            >
              ×
            </button>
          </div>

          {/* รายการข้อความ */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto text-sm bg-gray-50">
            {messages.map((msg, index) => {
              const isUser = msg.from === "user";
              return (
                <div
                  key={index}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[80%] space-y-1">
                    <div
                      className={`text-[11px] text-gray-400 ${
                        isUser ? "text-right" : "text-left"
                      }`}
                    >
                      {isUser ? "คุณ" : "AI Chatbot"}
                    </div>
                    <div
                      className={`
                        px-3 py-2 rounded-2xl 
                        whitespace-pre-line break-words
                        ${
                          isUser
                            ? "bg-indigo-600 text-white rounded-br-sm shadow-sm"
                            : "bg-white text-gray-800 rounded-bl-sm shadow"
                        }
                      `}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}

            {/*ตัว marker ด้านล่างสุดเอาไว้ให้ scrollIntoView หา */}
            <div ref={messagesEndRef} />
          </div>

          {/* ช่องพิมพ์ */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-gray-200 p-3 flex gap-2 bg-white"
          >
            <input
              type="text"
              className="
                flex-1 text-sm border border-gray-300 
                rounded-full px-3 py-2 
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              "
              placeholder="พิมพ์คำถาม เช่น จัดสเปคคอมเล่นเกมงบ 30000"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
            />
            <button
              type="submit"
              className="
                text-sm px-4 py-2 rounded-full 
                bg-indigo-600 text-white 
                hover:bg-indigo-700 active:scale-95 
                transition disabled:opacity-60 disabled:cursor-not-allowed
              "
              disabled={isSending}
            >
              {isSending ? "..." : "ส่ง"}
            </button>
          </form>
        </div>
      )}

      {/* ปุ่มลอยมุมขวาล่าง */}
      <button
        onClick={toggleChat}
        className="
          fixed bottom-4 right-4 
          w-16 h-16 rounded-full shadow-xl 
          bg-indigo-600 hover:bg-indigo-700 
          text-white flex items-center justify-center text-3xl 
          active:scale-95 transition z-40
        "
        aria-label="เปิด chat กับ chatbot"
      >
        💬
      </button>
    </>
  );
};

export default ChatbotWidget;
