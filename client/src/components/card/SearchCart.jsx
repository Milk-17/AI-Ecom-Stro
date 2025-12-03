import React, { useEffect, useState } from "react";
import useEcomStore from "../../store/ecom-store";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { numberFormat } from "../../utils/number"; // <--- 1. เพิ่ม import

const SearchCart = () => {
  const getProduct = useEcomStore((state) => state.getProduct);
  const actionSearchFilters = useEcomStore((state) => state.actionSearchFilters);
  const getCategory = useEcomStore((state) => state.getCategory);
  const categories = useEcomStore((state) => state.categories);

  const [text, setText] = useState("");
  const [mainCategorySelected, setMainCategorySelected] = useState(null);
  const [subCategorySelected, setSubCategorySelected] = useState(null);
  const [price, setPrice] = useState([100, 50000]);
  const [ok, setOk] = useState(false);

  // โหลด category
  useEffect(() => {
    getCategory();
  }, []);

  // Search by text
  useEffect(() => {
    const delay = setTimeout(() => {
      if (text) actionSearchFilters({ query: text });
      else getProduct();
    }, 300);
    return () => clearTimeout(delay);
  }, [text]);

  // Search by category
  useEffect(() => {
    let categoryIds = [];

    if (subCategorySelected) {
      // 1. ถ้าเลือก SubCategory: ใช้ ID นั้นเลย
      categoryIds = [subCategorySelected];

    } else if (mainCategorySelected) {
      // 2. ถ้าเลือก Main Category (แต่ยังไม่เลือก Sub):
      // ให้หา Main Category นั้นใน Store
      const selectedMain = categories.find(
        (c) => c.id === mainCategorySelected
      );

      // แล้วดึง ID ของ "SubCategories ลูก" ทั้งหมดของมันออกมา
      if (selectedMain?.subCategories) {
        categoryIds = selectedMain.subCategories.map((s) => s.id);
      }
    }

    // 3. ถ้ามี ID (ไม่ว่าจากข้อ 1 หรือ 2) ให้ส่งไป Filter
    if (categoryIds.length > 0) {
      actionSearchFilters({ category: categoryIds });
    } else {
      // ถ้าไม่ได้เลือกอะไรเลย ให้ดึงสินค้าทั้งหมด
      getProduct();
    }
  }, [mainCategorySelected, subCategorySelected, categories]);

  // Search by price
  useEffect(() => {
    actionSearchFilters({ price });
  }, [ok]);

  const handlePrice = (value) => {
    setPrice(value);
    setTimeout(() => setOk(!ok), 300);
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">ค้นหาสินค้า</h1>

      {/* Search by Text */}
      <input
        type="text"
        placeholder="ค้นหาสินค้า..."
        className="border rounded-md w-full mb-4 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <hr className="mb-4"/>

      {/* Search by Category */}
      <div className="mb-4">
        <h1 className="font-semibold mb-2">หมวดหมู่สินค้า</h1>

        {/* Main Category */}
        <select
          className="border rounded-md px-2 py-1 w-full mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={mainCategorySelected || ""}
          onChange={(e) => {
            const mainId = Number(e.target.value) || null;
            setMainCategorySelected(mainId);
            setSubCategorySelected(null); // reset sub when main changes
          }}
        >
          <option value="">-- เลือกหมวดหมู่หลัก --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Sub Category */}
        {mainCategorySelected && (
          <select
            className="border rounded-md px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={subCategorySelected || ""}
            onChange={(e) => {
              const subId = Number(e.target.value) || null;
              setSubCategorySelected(subId);
            }}
          >
            <option value="">-- เลือกหมวดหมู่ย่อย --</option>
            {categories
              .find((c) => c.id === mainCategorySelected)
              ?.subCategories?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
        )}
      </div>

      <hr className="mb-4" />

      {/* Search by Price */}
      <div>
        <h1 className="font-semibold mb-2">ค้นหาราคา</h1>
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            {/* <--- 2. แก้ไขตรงนี้ ใส่ numberFormat */}
            <span>Min : {numberFormat(price[0])}</span>
            <span>Max : {numberFormat(price[1])}</span>
          </div>
          <Slider
            onChange={handlePrice}
            range
            min={0}
            max={150000}
            defaultValue={[100, 50000]}
            trackStyle={{ backgroundColor: '#2563eb' }} // ปรับสีเส้น Slider ให้สวยขึ้น
            handleStyle={{ borderColor: '#2563eb', backgroundColor: '#2563eb' }} // ปรับสีปุ่ม Slider
          />
        </div>
      </div>
    </div>
  );
};

export default SearchCart;