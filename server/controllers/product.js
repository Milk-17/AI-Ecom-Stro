const prisma = require("../config/prisma");
const cloudinary  = require('cloudinary').v2;

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ===================== CREATE PRODUCT =====================
exports.create = async (req, res) => {
    try {
        // รับค่าจาก Frontend
        // หมายเหตุ: categoryId ที่รับมานี้ จริงๆ แล้วคือ "SubCategory ID" (ตาม Form ของคุณ)
        const { title, description, price, quantity, categoryId, images } = req.body;

        // 1. ดักสินค้าซ้ำ
        const exist = await prisma.product.findFirst({ where: { title } });
        if (exist) return res.status(400).json({ message: `Product "${title}" มีอยู่แล้ว` });

        // *** เริ่มต้นการแก้ไข: ค้นหา Main Category ID ***
        const subCatId = parseInt(categoryId);
        
        // เช็คว่ามี SubCategory นี้อยู่จริงไหม และใครเป็นพ่อ (Main Category)
        const subCategoryInfo = await prisma.subCategory.findUnique({
            where: { id: subCatId }
        });

        if (!subCategoryInfo) {
            return res.status(400).json({ message: "ไม่พบหมวดหมู่ย่อยที่ระบุ" });
        }
        // *** สิ้นสุดการแก้ไขส่วนค้นหา ***

        // 2. สร้างสินค้า
        const product = await prisma.product.create({
            data: {
                title,
                description,
                price: parseFloat(price),
                quantity: Number(quantity),
                // *** ใส่ ID ให้ถูกช่อง ***
                categoryId: subCategoryInfo.categoryId, // ใส่ ID พ่อ (ที่หาเจอจาก Database)
                subCategoryId: subCatId,                // ใส่ ID ลูก (ที่ส่งมาจาก Frontend)
                // ***********************
                images: {
                    create: images.map(item => ({
                        asset_id: item.asset_id,
                        public_id: item.public_id,
                        url: item.url,
                        secure_url: item.secure_url,
                    }))
                }
            }
        });

        // 3. สร้าง log การสร้างสินค้า
        await prisma.adminLog.create({
            data: {
                adminId: req.user.id,
                action: "create",
                productId: product.id,
                message: `เพิ่มสินค้า ${product.title}`,
            }
        });

        // 4. สร้าง ProductPriceHistory สำหรับราคาปัจจุบัน
        await prisma.productPriceHistory.create({
            data: {
                productId: product.id,
                oldPrice: 0,
                newPrice: parseFloat(price),
                changedById: req.user.id,
            }
        });

        res.send(product);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "create product controllers Error" });
    }
};  

// ===================== LIST PRODUCTS =====================
exports.list = async(req,res) =>{
    try{
        const {count} = req.params;
        const products = await prisma.product.findMany({
            take: parseInt(count),
            orderBy: { createdAt : "desc"},
            include: {
                category: true,
                subCategory: true,
                images: true
            } 
        });
        res.send(products);

    } catch (err){
        console.log(err);
        res.status(500).json({ message : "list product controllers Error" })
    }
};

// ===================== READ PRODUCT =====================
exports.read = async(req,res) =>{
    try{
        const {id} = req.params;
        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
            include: {
                category: true,
                subCategory: true,
                images: true
            } 
        });
        res.send(product);

    } catch (err){
        console.log(err);
        res.status(500).json({ message : "read product controllers Error" })
    }
};

// ===================== UPDATE PRODUCT =====================
exports.update = async(req,res) => {
    try{
        const {title,description,price,quantity,categoryId,subCategoryId,images} = req.body;

        const oldProduct = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });

        // ลบรูปเดิม
        await prisma.image.deleteMany({ where: { productId: Number(req.params.id) } });

        const product = await prisma.product.update({
            where: { id: Number(req.params.id) },
            data:{
                title,
                description,
                price: parseFloat(price),
                quantity: Number(quantity),
                categoryId: categoryId ? parseInt(categoryId) : null,
                subCategoryId: subCategoryId ? parseInt(subCategoryId) : null,
                images:{
                    create: images.map(item=> ({
                        asset_id: item.asset_id,  
                        public_id: item.public_id,
                        url: item.url,
                        secure_url: item.secure_url
                    }))
                }
            }
        });

        // สร้าง admin log
        await prisma.adminLog.create({
            data:{
                adminId: req.user.id,
                action: "update",
                productId: product.id,
                message: `แก้ไขสินค้า ${product.title}`
            }
        });

        // เพิ่ม ProductPriceHistory ถ้าราคาเปลี่ยน
        if (oldProduct.price !== parseFloat(price)) {
            await prisma.productPriceHistory.create({
                data: {
                    productId: product.id,
                    oldPrice: oldProduct.price,
                    newPrice: parseFloat(price),
                    changedById: req.user.id,
                }
            });
        }

        res.send(product);

    } catch (err){
        console.log(err);
        res.status(500).json({ message : "update product controllers Error" });
    }
};

// ===================== REMOVE PRODUCT =====================
exports.remove = async(req,res) => {
    try{
        const {id} = req.params;

        const product = await prisma.product.findUnique({
            where : { id: Number(id) },
            include: { images: true }
        });

        if (!product){
            return res.status(400).json ({ message : 'No Product!!!' });
        }

        // ลบรูปใน Cloudinary
        const deleteImage = product.images.map((image) =>
            new Promise((resolve,reject) =>{
                cloudinary.uploader.destroy(image.public_id,(error,result) =>{
                    if (error) reject(error);
                    else resolve(result);
                })
            })
        );
        await Promise.all(deleteImage);

        // ลบสินค้า
        await prisma.product.delete({ where:{ id:Number(id) } });

        // สร้าง log
        await prisma.adminLog.create({
            data:{
                adminId: req.user.id,
                action: "delete",
                productId: Number(id),
                message: `ลบสินค้า ${product.title}`
            }
        });

        res.send('Deleted Success');

    } catch (err){
        console.log(err);
        res.status(500).json({ message : "remove product controllers Error" });
    }
};

// ===================== SEARCH / FILTER =====================
const handleQuery = async(req,res,query) => {
    try{
        const products = await prisma.product.findMany({
            where: { title: { contains: query } },
            include: { category:true, subCategory:true, images:true }
        });
        res.send(products);
    } catch (err){
        console.log(err);
        res.status(500).json({ message:"handleQuery Error"});
    }
};

const handlePrice = async(req,res,priceRange) =>{
    try{
        const products = await prisma.product.findMany({
            where:{ price:{ gte: priceRange[0], lte: priceRange[1] } },
            include:{ category:true, subCategory:true, images:true }
        });
        res.send(products);
    } catch (err){
        console.log(err);
        res.status(500).json({ message: "handlePrice Error"});
    }
};

const handleCategory = async(req,res,categoryId) =>{
     try{
     const products = await prisma.product.findMany({
                // *** แก้ไขตรงนี้: เปลี่ยน categoryId เป็น subCategoryId ***
     where:{ 
                    subCategoryId: {  // <--- ใช้ subCategoryId แทน
                        in: categoryId.map(id=> Number(id)) 
                    } 
                },
     include:{ category:true, subCategory:true, images:true }
     });
     res.send(products);
     } catch (err){
     console.log(err);
     res.status(500).json({ message: "handleCategory Error"});
     }
    };

exports.searchFilters = async(req,res) =>{
    try{
        const { query, category, price } = req.body;
        if(query) await handleQuery(req,res,query);
        if(category) await handleCategory(req,res,category);
        if(price) await handlePrice(req,res,price);
    } catch (err){
        console.log(err);
        res.status(500).json({ message : "searchFilters product controllers Error" })
    }
};

// ===================== IMAGE =====================
exports.createImages = async (req,res) => {
    try{
        const result = await cloudinary.uploader.upload(req.body.image,{
            public_id: `EcomAI-${Date.now()}`,
            result_type: 'auto',
            folder:'EcomAI'
        });
        res.send(result)
    } catch(err) {
        console.log(err)
        res.status(500).json({ message: "Create Image Error"});
    }
};

exports.removeImage = async (req,res) => {
    try{
        const { public_id } = req.body;
        cloudinary.uploader.destroy(public_id,(result) => {
            res.send('Remove Images Success!!!')
        });
    } catch(err) {
        console.log(err)
        res.status(500).json({ message: "remove Image Error"});
    }
};

// ===================== LIST ADMIN LOGS =====================
exports.listAdminLogs = async (req, res) => {
    try {
        const logs = await prisma.adminLog.findMany({
            include: { admin: true, product: true },
            orderBy: { createdAt: 'desc' }
        });
        res.send(logs);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error in listAdminLogs" });
    }
};

// ===================== LIST BY =====================
exports.listby = async (req, res) => {
    try {
      const { sort = "createdAt", order = "desc", limit = 10 } = req.body;
  
      const products = await prisma.product.findMany({
        take: Number(limit),
        orderBy: { [sort]: order },
        include: { images: true, category: true, subCategory: true },
      });
  
      res.send(products);
    } catch (err) {
      console.log("❌ listby error:", err);
      res.status(500).json({ message: "listby product controllers Error" });
    }
  };

// ===================== GET PRODUCT PRICE HISTORY =====================
exports.getAllProductPriceHistory = async (req, res) => {
    try {
      const history = await prisma.productPriceHistory.findMany({
        include: {
          changedBy: true, // ผู้แก้ไข
          product: true    // สินค้าที่แก้ไข
        },
        orderBy: {
          changedAt: 'desc' // เรียงจากล่าสุดไปเก่าสุด
        }
      });
      res.json(history);
    } catch (err) {
      console.log('❌ getAllProductPriceHistory error:', err);
      res.status(500).json({ message: "getAllProductPriceHistory controllers Error" });
    }
  };
  

