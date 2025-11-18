import React , { useState , useEffect} from 'react'
import { createCategory , listCategory , removeCategory, createSubCategory , removeSubCategory } from '../../api/Category'
import useEcomStore from '../../store/ecom-store'
import { toast } from "react-toastify";


const FormCategory = () => {
  // javascript
  const token = useEcomStore((state) => state.token);
  const [name, setName] = useState('');
  
  // categories จะมีหน้าตาแบบนี้: [{ id: 1, name: '...', subCategories: [...] }]
  const categories = useEcomStore((state) => state.categories);
  const getCategory = useEcomStore((state) => state.getCategory);
  
  // parentId คือ ID ของ Main Category ที่ถูกเลือกใน dropdown
  const [parentId, setParentId] = useState(''); 

  useEffect(() => {
    getCategory(token); // เรียก listCategory()
  }, [getCategory, token]); // <--- เพิ่ม dependencies ให้ useEffect


  // *** เริ่มต้นการแก้ไข: ปรับ handleSubmit ให้เรียก API ถูกต้อง ***
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let res;
      if (parentId) {
        // --- 1. สร้าง SubCategory ---
        // (เราตรวจสอบ duplicate check ที่ Backend แล้ว)
        res = await createSubCategory(token, { name, categoryId: parentId });
        toast.success(`Add SubCategory "${res.data.name}" is created`);
      } else {
        // --- 2. สร้าง Main Category ---
        // (เราตรวจสอบ duplicate check ที่ Backend แล้ว)
        res = await createCategory(token, { name }); // Backend ไม่ต้องการ parentId: null
        toast.success(`Add Category "${res.data.name}" is created`);
      }
      
      setName(''); // reset input
      setParentId(''); // reset dropdown
      getCategory(token); // โหลดข้อมูลใหม่

    } catch (err) {
      console.log(err);
      // แสดง Error ที่ส่งมาจาก Backend (ที่เราทำไว้)
      if (err.response && err.response.data) {
         toast.error(err.response.data.message);
      } else {
         toast.error("An error occurred.");
      }
    }
  };
  // *** สิ้นสุดการแก้ไข: ปรับ handleSubmit ***


  // *** เริ่มต้นการแก้ไข: แยกฟังก์ชันลบ Category และ SubCategory ***

  // ลบ Main Category
  const handleRemoveCategory = async (id, name) => {
    // ใช้ window.confirm เพื่อยืนยันก่อนลบ
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ ${name}? (หากมีหมวดหมู่ย่อยจะไม่สามารถลบได้)`)) {
      try {
        const res = await removeCategory(token, id); // เรียก API ลบแม่
        toast.success(`Delete Category "${res.data.name}" is deleted`);
        getCategory(token);
      } catch (err) {
        console.log(err);
        // ดัก Error ที่เราทำไว้ที่ Backend (เช่น "Cannot delete category with subcategories")
        if (err.response && err.response.data) {
          toast.error(err.response.data.message);
        } else {
          toast.error("Error deleting category.");
        }
      }
    }
  };

  // ลบ SubCategory
  const handleRemoveSubCategory = async (id, name) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ ${name}?`)) {
      try {
        const res = await removeSubCategory(token, id); // เรียก API ลบลูก
        toast.success(`Delete SubCategory "${res.data.name}" is deleted`);
        getCategory(token);
      } catch (err) {
        console.log(err);
         if (err.response && err.response.data) {
          toast.error(err.response.data.message);
        } else {
          toast.error("Error deleting subcategory.");
        }
      }
    }
  };
  // *** สิ้นสุดการแก้ไข: แยกฟังก์ชันลบ ***


  return (
    <div className='container mx-auto p-4 bg-white shadow-md rounded-md'>
        <h1>Category Management</h1>
        <form className='my-4' onSubmit={handleSubmit}>
            <input
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className='border border-gray-300 p-2 rounded-md mr-2'
              type='text'
              placeholder="Category Name" 
              required // <-- เพิ่ม: บังคับกรอก
            />

            {/* *** เริ่มต้นการแก้ไข: ปรับ Dropdown ให้ตรงกับโครงสร้างข้อมูล *** */}
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className='border border-gray-300 p-2 rounded-md mr-2'
            >
              <option value=''>-- สร้างเป็น Main Category --</option>
              {categories.map(cat => ( // <-- วน Loop categories ได้เลย
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {/* *** สิ้นสุดการแก้ไข: ปรับ Dropdown *** */}
            
            <button className='bg-blue-700 text-white p-2 rounded-md '>Add Category</button>
        </form>
        <hr /> 

        {/* *** เริ่มต้นการแก้ไข: ปรับการแสดงผลให้ตรงกับข้อมูลที่ Backend ส่งมา *** */}
        <ul className='list-none'>
          {/* 1. วน Loop Main Category (categories) */}
          {categories.map(main => (
            <React.Fragment key={main.id}>
              {/* แสดง Main Category */}
              <li className='flex justify-between my-2 p-2 border-b bg-gray-100 font-bold'>
                <span>{main.name}</span>
                <button
                  className='bg-red-600 text-white px-2 py-1 rounded'
                  onClick={() => handleRemoveCategory(main.id, main.name)} // <-- เรียกใช้ handleRemoveCategory
                >
                  Delete
                </button>
              </li>
              
              {/* 2. วน Loop SubCategories ที่อยู่ใน Main Category นั้นๆ */}
              {main.subCategories.map(sub => ( 
                <li key={sub.id} className='flex justify-between my-2 ml-6 p-2 border-b text-gray-600'>
                  <span>- {sub.name}</span>
                  <button
                    className='bg-red-500 text-white px-2 py-1 rounded' // <-- อาจใช้สีแดงอ่อนลง
                    onClick={() => handleRemoveSubCategory(sub.id, sub.name)} // <-- เรียกใช้ handleRemoveSubCategory
                  >
                    Delete
                  </button>
                </li>
              ))}
            </React.Fragment>
          ))}
        </ul>
        {/* *** สิ้นสุดการแก้ไข: ปรับการแสดงผล *** */}

    </div>
  )
}

export default FormCategory