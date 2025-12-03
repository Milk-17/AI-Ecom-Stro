// client/src/utils/number.js

export const numberFormat = (num) => {
    // ป้องกันกรณีค่าเป็น null/undefined
    if (num === null || num === undefined) {
      return "0.00 ฿"; 
    }
  
    // ใช้ Intl.NumberFormat ของ Javascript (มาตรฐานสากล)
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0, // ถ้าอยากได้ทศนิยม 2 ตำแหน่ง ให้แก้เลข 0 เป็น 2
      maximumFractionDigits: 0, 
    }).format(num);
  };