const prisma = require("../config/prisma");
const { Prisma } = require("@prisma/client");


// ---------------- Category Controller ----------------

// สร้าง Category (Main Category)
exports.createCategory = async (req, res) => {
   try {
   const { name } = req.body;
  
  // *** เริ่มต้นการแก้ไข: ป้องกันข้อมูลซ้ำ และ Validation ***
   // 1. ตรวจสอบว่ามี name ส่งมาหรือไม่
   if (!name) {
   return res.status(400).json({ message: "Name is required" });
   }
  
   // 2. ตรวจสอบว่ามี Category ชื่อนี้อยู่แล้วหรือไม่ (ป้องกันซ้ำ)
   const existingCategory = await prisma.category.findFirst({ // <--- ✅ แก้ไขเป็น findFirst
     where: { name: name }, 
     });
  
   if (existingCategory) {
   return res.status(400).json({ message: "Category with this name already exists" });
   }
  // *** สิ้นสุดการแก้ไข: ป้องกันข้อมูลซ้ำ และ Validation ***
  
   const category = await prisma.category.create({
   data: { name },
   });
  
   res.status(201).send(category); // <--- ปรับ Status Code เป็น 201 (Created)
   } catch (err) {
   console.log(err);
   res.status(500).json({ message: "create category controller Error" });
   }
  };

// ดึง Categories พร้อม SubCategories
exports.listCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { subCategories: true },
    });
    res.send(categories);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "list category controller Error" });
  }
};

// ลบ Category
exports.removeCategory = async (req, res) => {
    try {
      const { id } = req.params;
  
  // *** เริ่มต้นการแก้ไข: ปรับปรุง Logic การลบและ Error Handling ***
      const categoryId = Number(id);
  
      // 1. ตรวจสอบว่า ID เป็นตัวเลขที่ถูกต้อง
      if (isNaN(categoryId)) {
          return res.status(400).json({ message: "Invalid Category ID" });
      }
  
      // 2. ตรวจสอบว่ามี subcategory อยู่หรือไม่ (Logic เดิมของคุณ ถูกต้องแล้ว)
      const subCategories = await prisma.subCategory.findMany({
        where: { categoryId: categoryId },
      });
  
      if (subCategories.length > 0) {
        return res
          .status(400)
          .json({ message: "Cannot delete category with subcategories" });
      }
  
      // 3. ทำการลบ
      const category = await prisma.category.delete({
        where: { id: categoryId },
      });
  // *** สิ้นสุดการแก้ไข: ปรับปรุง Logic การลบและ Error Handling ***
  
      res.send(category);
    } catch (err) {
  // *** เริ่มต้นการแก้ไข: จัดการ Error กรณีหา ID ไม่เจอ ***
      // 4. ดักจับ Error กรณีลบไม่สำเร็จ (เช่น หา ID ที่จะลบไม่เจอ)
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return res.status(404).json({ message: "Category not found" });
      }
  // *** สิ้นสุดการแก้ไข: จัดการ Error กรณีหา ID ไม่เจอ ***
      console.log(err);
      res.status(500).json({ message: "remove category controller Error" });
    }
  };

// ---------------- SubCategory Controller ----------------

// สร้าง SubCategory
exports.createSubCategory = async (req, res) => {
    try {
      const { name, categoryId } = req.body; // categoryId = parent category
  
  // *** เริ่มต้นการแก้ไข: ป้องกันข้อมูลซ้ำ และ Validation ***
      // 1. ตรวจสอบ Input
      if (!name || !categoryId) {
        return res.status(400).json({ message: "Name and categoryId are required" });
      }
  
      const parentId = Number(categoryId);
      if (isNaN(parentId)) {
          return res.status(400).json({ message: "Invalid Category ID" });
      }
  
      // 2. ตรวจสอบว่า Category (แม่) ที่จะเอาไปเชื่อม มีอยู่จริงหรือไม่
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      });
  
      if (!parentCategory) {
        return res.status(404).json({ message: "Parent Category not found" });
      }
  
      // 3. ตรวจสอบข้อมูลซ้ำ (ป้องกันการสร้าง SubCategory ชื่อซ้ำ ภายใต้ Category แม่ เดียวกัน)
      const existingSubCategory = await prisma.subCategory.findFirst({
        where: {
          name: name,
          categoryId: parentId,
        },
      });
  
      if (existingSubCategory) {
        return res.status(400).json({ message: "This subcategory already exists in this category" });
      }
  // *** สิ้นสุดการแก้ไข: ป้องกันข้อมูลซ้ำ และ Validation ***
  
      const subCategory = await prisma.subCategory.create({
        data: {
          name,
          category: { connect: { id: parentId } }, // <--- ใช้ parentId ที่เราตรวจสอบแล้ว
        },
      });
  
      res.status(201).send(subCategory); // <--- ปรับ Status Code เป็น 201 (Created)
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "create subcategory controller Error" });
    }
  };

// ดึง SubCategories พร้อม Category
exports.listSubCategories = async (req, res) => {
  try {
    const subCategories = await prisma.subCategory.findMany({
      include: { category: true }, // include parent category
    });

    res.send(subCategories);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "list subcategory controller Error" });
  }
};

// ลบ SubCategory
exports.removeSubCategory = async (req, res) => {
   try {
    const { id } = req.params;
  
  // *** เริ่มต้นการแก้ไข: ปรับปรุง Logic การลบและ Error Handling ***
      const subId = Number(id);
  
      // 1. ตรวจสอบว่า ID เป็นตัวเลขที่ถูกต้อง
      if (isNaN(subId)) {
          return res.status(400).json({ message: "Invalid SubCategory ID" });
      }
  
    const subCategory = await prisma.subCategory.delete({
     where: { id: subId },
    });
  // *** สิ้นสุดการแก้ไข: ปรับปรุง Logic การลบและ Error Handling ***
  
    res.send(subCategory);
   } catch (err) {
  // *** เริ่มต้นการแก้ไข: จัดการ Error กรณีหา ID ไม่เจอ ***
    // 2. ดักจับ Error กรณีลบไม่สำเร็จ (เช่น หา ID ที่จะลบไม่เจอ)
   if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
   return res.status(404).json({ message: "SubCategory not found" });
   }
  // *** สิ้นสุดการแก้ไข: จัดการ Error กรณีหา ID ไม่เจอ ***
   console.log(err);
   res.status(500).json({ message: "remove subcategory controller Error" });
   }
  };
