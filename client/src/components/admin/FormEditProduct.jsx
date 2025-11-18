import React, { useEffect, useState } from "react";
import useEcomStore from "../../store/ecom-store";
import { createProduct , readProduct ,listProduct, updateProduct } from "../../api/product";
import { toast } from "react-toastify";
import Uploadfile from "./Uploadfile";
import { useParams , useNavigate } from 'react-router-dom'

const initialState = {
  title:"adapter10",
    description:"desc",
    price: 200,
    quantity: 10,
    categoryId: 20,
    images: []
};

const FormEditProduct = () => {
  const { id } = useParams ()
  const navigate = useNavigate()

  const token = useEcomStore((state) => state.token);
  const categories = useEcomStore((state) => state.categories);
  const getCategory = useEcomStore((state) => state.getCategory);
  //console.log(products);

  const [form, setForm] = useState(initialState);

  useEffect(() => {
    getCategory()
    fetchProduct(token,id ,form)
 
  }, [])

  const fetchProduct = async (token) => {
    try{
      const res = await readProduct (token , id ,form)
      console.log('res form backend' , res)
      setForm (res.data)
    }catch(err){
      console.log('Error fetch data for EditProduct', err)
    }
  }



  const handleOnChange = (e) => {
    console.log(e.target.name, e.target.value);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handdleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProduct(token,id, form);
      console.log(res);
      toast.success(`เพิ่มสินค้า ${res.data.title} เรียบร้อย`);
      navigate('/admin/product')
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white shadow-md rounded-md">
      <form onSubmit={handdleSubmit} className="flex flex-col space-y-4">
        <h1>เพิ่มข้อมูลสินค้าที่ต้องการแก้ไข</h1>
        <input
          className="border border-gray-300 p-2 rounded-md mr-2"
          onChange={handleOnChange}
          value={form.title}
          name="title"
          placeholder="title"
        />

        <h1>รายละเอียด</h1>
        <input
          className="border border-gray-300   p-2 rounded-md mr-2"
          onChange={handleOnChange}
          value={form.description}
          name="description"
          placeholder="description"
        />

        <h1>ราคา</h1>
        <input
          className="border border-gray-300  p-2 rounded-md mr-2"
          type="number"
          onChange={handleOnChange}
          value={form.price}
          name="price"
          placeholder="price"
        />

        <h1>จำนวน</h1>
        <input
          className="border border-gray-300  p-2 rounded-md mr-2"
          type="number"
          onChange={handleOnChange}
          value={form.quantity}
          name="quantity"
          placeholder="quantity"
        />

        <select
          className="border"
          name="categoryId"
          onChange={handleOnChange}
          required
          value={form.categoryId}
        >
          <option value="" disabled>
            กรุณาเลือกหมวดหมู่
          </option>
          {categories.map((item, index) => (
            <option key={index} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <hr />
          {/* Upload File   */}
          <Uploadfile form={form} setForm={setForm}/>

        <button className="bg-blue-700 p-2 space-y-2 rounded-md ">
          แก้ไขสินค้า
        </button>

        <hr />
        <br />

      </form>
    </div>
  );
};

export default FormEditProduct;
