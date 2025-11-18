import axios from 'axios';




export const createCategory = async (token , form) => {
    return await axios.post('http://localhost:5001/api/category',form,{
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}

export const listCategory = async () => {
    return await axios.get('http://localhost:5001/api/category')
}
    
export const removeCategory = async (token,id) => {
    return await axios.delete('http://localhost:5001/api/category/'+id,{
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}


// สร้าง SubCategory
export const createSubCategory = async (token, form) => {
    // 'form' คือ object ที่มี { name, categoryId }
    return await axios.post(
      "http://localhost:5001/api/subcategory", // <--- ใช้ endpoint ของ subcategory
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`, // <--- ใช้ Auth header รูปแบบเดียวกับ createCategory
        },
      }
    );
  };
  
  // ลบ SubCategory
  export const removeSubCategory = async (token, id) => {
    return await axios.delete(
      "http://localhost:5001/api/subcategory/" + id, // <--- ใช้ endpoint ของ subcategory
      {
        headers: {
          Authorization: `Bearer ${token}`, // <--- ใช้ Auth header รูปแบบเดียวกับ removeCategory
        },
      }
    );
  };
  // *** สิ้นสุดการแก้ไข ***
