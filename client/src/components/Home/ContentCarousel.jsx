import React from "react"; // ไม่ต้องใช้ useState, useEffect แล้วเพราะรูป fix ตายตัว
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Pagination, Autoplay, Navigation } from "swiper/modules";

// --------------------------------------------------------
// 1. IMPORT รูปภาพจาก Folder
// (เช็คจำนวน ../ ให้ถูก ขึ้นอยู่กับว่าไฟล์นี้ซ้อนลึกแค่ไหนเมื่อเทียบกับ folder assets)
// --------------------------------------------------------
import promoImg1 from "../../assets/promotion_pic/promo1.jpg";
import promoImg2 from "../../assets/promotion_pic/promo2.jpg";
import promoImg3 from "../../assets/promotion_pic/promo3.jpg";
import promoImg4 from "../../assets/promotion_pic/promo4.jpg"; 
import promoImg5 from "../../assets/promotion_pic/promo5.jpg";

const ContentCarousel = () => {
  
  // --------------------------------------------------------
  // 2. เตรียมข้อมูล Array (เอาตัวแปรที่ import มาใส่ในนี้)
  // --------------------------------------------------------
  const promotionImages = [
    { id: 1, image: promoImg1, alt: "" },
    { id: 2, image: promoImg2, alt: "" },
    { id: 3, image: promoImg3, alt: "" },
    { id: 4, image: promoImg4, alt: "" },
    { id: 5, image: promoImg5, alt: "" },
  ];

  return (
    <div className="p-4">
      <Swiper
        // Responsive Breakpoints
        breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 10 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
        }}
        pagination={{ clickable: true }}
        navigation={true}
        modules={[Pagination, Autoplay, Navigation]}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        className="mySwiper rounded-md"
      >
        {/* 3. วนลูปจาก promotionImages */}
        {promotionImages.map((item) => (
          <SwiperSlide key={item.id}>
             <div className="overflow-hidden rounded-md h-64 shadow-md">
                <img 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    src={item.image}   // ใช้ตัวแปร image ที่เราเตรียมไว้
                    alt={item.alt}     // ใส่คำอธิบายรูป
                />
             </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ContentCarousel;