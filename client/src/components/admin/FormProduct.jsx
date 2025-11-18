// rafce
import React, { useEffect, useState } from "react";
import useEcomStore from "../../store/ecom-store";
import { createProduct, deleteProduct } from "../../api/product";
import { toast } from "react-toastify";
import Uploadfile from "./Uploadfile";
import { Link } from "react-router-dom";
import { PencilOff, Delete } from "lucide-react";

const initialState = {
  title: "",
  description: "",
  price: 0,
  quantity: 0,
  categoryId: "",
  images: [],
};

// *** เริ่มต้นการแก้ไข: แก้ชื่อ Component (PascalCase) ***
const FormProduct = () => {
  // *** สิ้นสุดการแก้ไข: แก้ชื่อ Component ***
  const token = useEcomStore((state) => state.token);
  const categories = useEcomStore((state) => state.categories);
  const getProduct = useEcomStore((state) => state.getProduct);
  const products = useEcomStore((state) => state.products);
  const getCategory = useEcomStore((state) => state.getCategory);

  const [form, setForm] = useState(initialState);
  const [selectedMainId, setSelectedMainId] = useState(""); // สำหรับ Main Category

  useEffect(() => {
    // *** เริ่มต้นการแก้ไข: ส่ง token ถ้า getCategory ใน store ต้องการ ***
    // (ไฟล์ admin ก่อนหน้านี้คุณมีการส่ง token ใน getCategory)
    getCategory(token);
    // *** สิ้นสุดการแก้ไข ***
    getProduct(100);
  }, [getCategory, getProduct, token]); // <-- เพิ่ม dependencies

  const handleOnChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // *** เริ่มต้นการแก้ไข: แก้ไขชื่อฟังก์ชัน (handleSubmit) ***
  const handleSubmit = async (e) => {
    // *** สิ้นสุดการแก้ไข: แก้ไขชื่อฟังก์ชัน ***
    e.preventDefault();
    // ตรวจสอบว่าเลือก SubCategory แล้ว
    if (!form.categoryId) {
      toast.error("กรุณาเลือก SubCategory");
      return;
    }

    try {
      const res = await createProduct(token, form);
      const productTitle = res.data?.product?.title || form.title;
      toast.success(`เพิ่มสินค้า ${productTitle} เรียบร้อย`);
      setForm(initialState);
      getProduct();
      setSelectedMainId("");
    } catch (err) {
      const errMsg = err.response?.data?.message || "Something went wrong";
      toast.error(errMsg);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete it?")) {
      try {
        await deleteProduct(token, id);
        getProduct();
        toast.success("Product deleted successfully");
      } catch (err) {
        console.log(err);
      }
    }
  };

  // *** เริ่มต้นการแก้ไข: ปรับ Logic การดึง SubCategory ให้ตรงกับข้อมูลแบบ Nested ***
  // 1. หา Main Category ที่ถูกเลือกจากใน Store
  const selectedMainCategory = categories.find(
    (cat) => cat.id === Number(selectedMainId)
  );

  // 2. ดึง Array ของ SubCategories ที่อยู่ข้างใน (ถ้ามี)
  const subCategories = selectedMainCategory?.subCategories || [];
  // *** สิ้นสุดการแก้ไข: ปรับ Logic การดึง SubCategory ***

  return (
    <div className="container mx-auto p-4 bg-white shadow-md rounded-md">
      {/* *** เริ่มต้นการแก้ไข: แก้ชื่อฟังก์ชันใน form *** */}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        {/* *** สิ้นสุดการแก้ไข: แก้ชื่อฟังก์ชันใน form *** */}
        <h1>เพิ่มข้อมูลสินค้า</h1>
        <input
          className="border border-gray-300 p-2 rounded-md mr-2"
          onChange={handleOnChange}
          value={form.title}
          name="title"
          placeholder="title"
        />

        <h1>รายละเอียด</h1>
        <textarea
          className="border border-gray-300 p-2 rounded-md mr-2 w-full h-48 resize-y"
          onChange={handleOnChange}
          value={form.description ?? ""}
          name="description"
          placeholder="description"
        />

        <h1>ราคา</h1>
        <input
          className="border border-gray-300 p-2 rounded-md mr-2"
          type="number"
          onChange={handleOnChange}
          value={form.price}
          name="price"
          placeholder="price"
        />

        <h1>จำนวน</h1>
        <input
          className="border border-gray-300 p-2 rounded-md mr-2"
          type="number"
          onChange={handleOnChange}
          value={form.quantity}
          name="quantity"
          placeholder="quantity"
        />

        {/* *** เริ่มต้นการแก้ไข: ปรับ Main Category Dropdown ให้ตรงข้อมูล Nested *** */}
        {/* Dropdown เลือก Main Category */}
        <select
          className="border p-2 rounded-md mr-2"
          value={selectedMainId}
          onChange={(e) => {
            setSelectedMainId(e.target.value);
            setForm({ ...form, categoryId: "" }); // Reset SubCategory เมื่อ Main เปลี่ยน
          }}
        >
          <option value="">เลือก Main Category</option>
          {/* วน Loop categories (ที่เป็น Main) ได้เลย */}
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {/* *** สิ้นสุดการแก้ไข: ปรับ Main Category Dropdown *** */}

        {/* Dropdown เลือก SubCategory */}
        <select
          className="border p-2 rounded-md mr-2"
          value={form.categoryId} // <-- ผูกกับ form.categoryId ถูกต้อง
          name="categoryId"
          onChange={handleOnChange} // <-- ใช้ handleOnChange ถูกต้อง
          disabled={!selectedMainId} // <-- ปิดไว้จนกว่าจะเลือก Main ถูกต้อง
          required // <-- บังคับเลือก ถูกต้อง
        >
          <option value="">เลือก SubCategory</option>
          {/* 'subCategories' ตอนนี้ถูกกรองมาอย่างถูกต้องแล้ว */}
          {subCategories.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>

        <hr />
        {/* Upload File */}
        <Uploadfile form={form} setForm={setForm} />

        <button className="bg-blue-700 p-2 space-y-2 rounded-md shadow-md hover:scale-100 hover:-translate-y-1 hover:duration-300">
          เพิ่มสินค้า
        </button>

        <hr />
        <br />
        <table className="table table-striped table-dark w-full">
          <thead>
            <tr className="bg-gray-200 border">
              <th>No.</th>
              <th>รูปภาพ</th>
              <th>ชื่อสินค้า</th>
              <th>รายละเอียด</th>
              <th>ราคา</th>
              <th>จำนวน</th>
              <th>จำนวนที่เหลือ</th>
              <th>วันที่อัพเดด</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item, index) => (
              <tr key={index}>
                <th>{index + 1}</th>
                <td>
                  {item.images.length > 0 ? (
                    <img
                      className="w-24 h-24 rounded-lg shadow-md"
                      src={item.images[0].url}
                      alt={item.title}
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-600 rounded-md flex items-center justify-center shadow-sm">
                      NO Image
                    </div>
                  )}
                </td>
                <td>{item.title}</td>
                <td>{item.description}</td>
                <td>{item.price}</td>
                <td>{item.quantity}</td>
                <td>{item.sold}</td>
                <td>{item.updatedAt}</td>
                <td className="flex gap-4">
                  {/* แก้ไขสินค้า */}
                  <Link
                    to={`/admin/product/${item.id}`}
                    className="bg-yellow-500 rounded-md p-1 hover:scale-105 hover:-translate-y-1 hover:duration-200 shadow-md"
                  >
                    <PencilOff />
                  </Link>

                  {/* ลบสินค้า */}
                  <p
                    className="bg-red-600 rounded-md p-1 shadow-md hover:scale-105 hover:-translate-y-1 hover:duration-200"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Delete />
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </form>
    </div>
  );
};

// *** เริ่มต้นการแก้ไข: แก้ชื่อ Component (PascalCase) ***
export default FormProduct;
// *** สิ้นสุดการแก้ไข: แก้ชื่อ Component ***
