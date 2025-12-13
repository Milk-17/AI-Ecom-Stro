import React, { useEffect, useState } from "react";
import useEcomStore from "../../store/ecom-store";
import { createProduct, deleteProduct } from "../../api/product";
import { toast } from "react-toastify";
import Uploadfile from "./Uploadfile";
import { Link } from "react-router-dom";
import {
  PencilOff,
  Delete,
  Box,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"; // เพิ่ม Icon ลูกศร
import { numberFormat } from "../../utils/number";

// Import Header
import ProductFilterHeader from "./ProductFilterHeader";

const initialState = {
  title: "",
  description: "",
  price: 0,
  quantity: 0,
  categoryId: "",
  images: [],
};

const FormProduct = () => {
  const token = useEcomStore((state) => state.token);
  const categories = useEcomStore((state) => state.categories);
  const getProduct = useEcomStore((state) => state.getProduct);
  const products = useEcomStore((state) => state.products);
  const getCategory = useEcomStore((state) => state.getCategory);

  const [form, setForm] = useState(initialState);
  const [selectedMainId, setSelectedMainId] = useState("");

  const actionDeleteProduct = useEcomStore((state) => state.actionDeleteProduct);

  // --- Filter State ---
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // --- Pagination State (เพิ่มใหม่) ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // แสดงหน้าละ 10 รายการ (แก้เลขตรงนี้ได้)
  useEffect(() => {
    getCategory(token);
    // สินค้า 300-500 ชิ้น โหลดมาทีเดียวไหวครับ (ใส่ 1000 เผื่อไว้เลย)
    getProduct(1000);
  }, [getCategory, getProduct, token]);

  const handleOnChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryId) {
      toast.error("กรุณาเลือก SubCategory");
      return;
    }
    if (form.price < 0 || form.quantity < 0) {
      toast.warning("ราคาและจำนวนต้องไม่ติดลบ");
      return;
    }

    try {
      const res = await createProduct(token, form);
      const productTitle = res.data?.product?.title || form.title;
      toast.success(`เพิ่มสินค้า ${productTitle} เรียบร้อย`);
      setForm(initialState);
      getProduct(1000);
      setSelectedMainId("");
    } catch (err) {
      const errMsg = err.response?.data?.message || "Something went wrong";
      toast.error(errMsg);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?")) {
      try {
        const res = await deleteProduct(token, id);
        console.log(res);
        toast.success("ลบสินค้าเรียบร้อยแล้ว");
        await getProduct(1000);
        actionDeleteProduct(id);
      } catch (err) {
        console.log(err);
      }
    }
  };

  // --- Logic การกรองข้อมูล ---
  const filteredProducts = products.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = categoryFilter
      ? item.categoryId === Number(categoryFilter) ||
        item.subCategoryId === Number(categoryFilter)
      : true;
    return matchesSearch && matchesCategory;
  });

  // --- Logic การแบ่งหน้า (Pagination) ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // เมื่อมีการค้นหา ให้กลับไปหน้า 1 เสมอ
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

  const selectedMainCategory = categories.find(
    (cat) => cat.id === Number(selectedMainId)
  );
  const subCategories = selectedMainCategory?.subCategories || [];

  const getStockStatus = (quantity) => {
    if (quantity === 0) {
      return (
        <span className="text-red-600 font-bold bg-red-100 px-2 py-1 rounded-full text-xs border border-red-200">
          สินค้าหมด!
        </span>
      );
    } else if (quantity < 8) {
      return (
        <span className="text-orange-600 font-bold bg-orange-100 px-2 py-1 rounded-full text-xs border border-orange-200">
          ใกล้หมด! ({quantity})
        </span>
      );
    }
    return <span className="text-gray-700 font-medium">{quantity}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200">
      {/* --- FORM SECTION (เหมือนเดิม) --- */}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-6 mb-10">
        <div className="flex items-center gap-2 border-b pb-4">
          <Box className="text-blue-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-800">
            จัดการสินค้า (Product Management)
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              ชื่อสินค้า
            </label>
            <input
              className="border border-gray-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none transition"
              onChange={handleOnChange}
              value={form.title}
              name="title"
              placeholder="Product Title"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              รายละเอียด
            </label>
            <textarea
              className="border border-gray-300 p-2.5 rounded-md w-full h-[46px] resize-none focus:ring-2 focus:ring-blue-500 outline-none overflow-hidden transition"
              onChange={handleOnChange}
              value={form.description ?? ""}
              name="description"
              placeholder="Description"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              ราคา (บาท)
            </label>
            <input
              className="border border-gray-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none transition"
              type="number"
              onChange={handleOnChange}
              value={form.price}
              name="price"
              placeholder="0.00"
              min="0"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              จำนวน (ชิ้น)
            </label>
            <input
              className="border border-gray-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none transition"
              type="number"
              onChange={handleOnChange}
              value={form.quantity}
              name="quantity"
              placeholder="0"
              min="0"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              หมวดหมู่หลัก
            </label>
            <select
              className="border border-gray-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
              value={selectedMainId}
              onChange={(e) => {
                setSelectedMainId(e.target.value);
                setForm({ ...form, categoryId: "" });
              }}
              required
            >
              <option value="">-- เลือก Main Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              หมวดหมู่ย่อย
            </label>
            <select
              className="border border-gray-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer disabled:bg-gray-100"
              value={form.categoryId}
              name="categoryId"
              onChange={handleOnChange}
              disabled={!selectedMainId}
              required
            >
              <option value="">-- เลือก SubCategory --</option>
              {subCategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-t pt-4">
          <Uploadfile form={form} setForm={setForm} />
        </div>

        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 font-bold w-full md:w-auto self-end flex items-center justify-center gap-2">
          <Box size={20} /> เพิ่มสินค้าเข้าระบบ
        </button>
      </form>

      {/* --- FILTER SECTION --- */}
      <ProductFilterHeader
        search={search}
        setSearch={setSearch}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        handleReset={() => {
          setSearch("");
          setCategoryFilter("");
        }}
      />

      {/* --- TABLE SECTION --- */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
            <tr>
              <th className="p-4 border-b text-center w-[5%]">No.</th>
              <th className="p-4 border-b text-center w-[10%]">รูปภาพ</th>
              <th className="p-4 border-b text-left w-[25%]">ชื่อสินค้า</th>
              <th className="p-4 border-b text-right w-[10%]">ราคา</th>
              <th className="p-4 border-b text-center w-[15%]">จำนวน</th>
              <th className="p-4 border-b text-center w-[10%]">ขายได้</th>
              <th className="p-4 border-b text-center w-[15%]">อัพเดท</th>
              <th className="p-4 border-b text-center w-[10%]">จัดการ</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-600">
            {currentProducts.length > 0 ? (
              currentProducts.map((item, index) => {
                // คำนวณลำดับจริง (เพราะเราแบ่งหน้า)
                const realIndex = indexOfFirstItem + index + 1;
                const isLowStock = item.quantity > 0 && item.quantity < 8;
                const isOutOfStock = item.quantity === 0;

                return (
                  <tr
                    key={index}
                    className={`border-b last:border-0 hover:bg-gray-50 transition duration-150 ${
                      isOutOfStock ? "bg-red-50" : ""
                    } ${isLowStock ? "bg-yellow-50" : ""}`}
                  >
                    <td className="p-3 text-center align-middle">
                      {realIndex}
                    </td>
                    <td className="p-3 text-center align-middle">
                      <div className="flex justify-center">
                        {item.images.length > 0 ? (
                          <img
                            className="w-12 h-12 rounded-md shadow-sm object-cover border border-gray-200"
                            src={item.images[0].url}
                            alt={item.title}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
                            No Pic
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 align-middle">
                      <div
                        className="font-medium text-gray-800 truncate"
                        title={item.title}
                      >
                        {item.title}
                      </div>
                      <div
                        className="text-xs text-gray-400 truncate mt-1"
                        title={item.description}
                      >
                        {item.description}
                      </div>
                    </td>
                    <td className="p-3 text-right align-middle font-mono font-semibold text-gray-700">
                      {numberFormat(item.price)}
                    </td>
                    <td className="p-3 text-center align-middle">
                      {getStockStatus(item.quantity)}
                    </td>
                    <td className="p-3 text-center align-middle font-medium">
                      {item.sold}
                    </td>
                    <td className="p-3 text-center align-middle text-xs whitespace-nowrap">
                      {formatDate(item.updatedAt)}
                    </td>
                    <td className="p-3 text-center align-middle">
                      <div className="flex justify-center gap-2">
                        <Link
                          to={`/admin/product/${item.id}`}
                          className="bg-yellow-100 text-yellow-600 p-2 rounded-md hover:bg-yellow-200 transition shadow-sm border border-yellow-200"
                          title="แก้ไข"
                        >
                          <PencilOff size={16} />
                        </Link>
                        <button
                          className="bg-red-100 text-red-600 p-2 rounded-md hover:bg-red-200 transition shadow-sm border border-red-200"
                          onClick={() => handleDelete(item.id)}
                          title="ลบสินค้า"
                        >
                          <Delete size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="p-8 text-center text-gray-500 bg-gray-50"
                >
                  ไม่พบสินค้าที่ค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- PAGINATION CONTROLS (ส่วนปุ่มกดเปลี่ยนหน้า) --- */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="text-sm font-medium text-gray-700">
            หน้า {currentPage} จาก {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FormProduct;
