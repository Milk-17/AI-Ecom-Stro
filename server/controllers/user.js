const prisma = require("../config/prisma")

exports.listUsers = async (req,res) => {
    try{
        //code
        const users = await prisma.user.findMany({
            select:{
                id:true,
                email:true,
                role:true,
                enable:true,
                address:true
            }
        })
        res.send(users)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "listUsers Error"})
    }
}
exports.changeStatus = async (req,res) => {
    try{
        //code
        const { id,enable } = req.body
        console.log(id,enable)
        const user = await prisma.user.update({
            where:{ id:Number(id)},
            data:{ enable: enable }
        })


        res.send('Update Status success')

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "changeStatus Error"})
    }
}
exports.changeRole = async (req,res) => {
    try{
        //code
        const { id,role } = req.body
   
        const user = await prisma.user.update({
            where:{ id:Number(id)},
            data:{ role: role }
        })
        res.send('Updete Role Success')

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "changeRole Error"})
    }
}
exports.userCart = async (req, res) => {
    try {
      //code
      const { cart } = req.body;
      console.log(cart);
      console.log(req.user.id);
  
      const user = await prisma.user.findFirst({
        where: { id: Number(req.user.id) },
      });
      // console.log(user)
  
      // Check quantity
      for (const item of cart) {
        // console.log(item)
        const product = await prisma.product.findUnique({
          where: { id: item.id },
          select: { quantity: true, title: true },
        });
        // console.log(item)
        // console.log(product)
        if (!product || item.count > product.quantity) {
          return res.status(400).json({
            ok: false,
            message: `ขออภัย. สินค้า ${product?.title || "product"} หมด`,
          });
        }
      }
  
      // Deleted old Cart item
      await prisma.productOnCart.deleteMany({
        where: {
          cart: {
            orderedById: user.id,
          },
        },
      });
      // Deeted old Cart
      await prisma.cart.deleteMany({
        where: { orderedById: user.id },
      });
  
      // เตรียมสินค้า
      let products = cart.map((item) => ({
        productId: item.id,
        count: item.count,
        price: item.price,
      }));
  
      // หาผลรวม
      let cartTotal = products.reduce(
        (sum, item) => sum + item.price * item.count,
        0
      );
  
      // New cart
      const newCart = await prisma.cart.create({
        data: {
          products: {
            create: products,
          },
          cartTotal: cartTotal,
          orderedById: user.id,
        },
      });
      console.log(newCart);
      res.send("Add Cart Ok");
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server Error" });
    }
  };
exports.getUserCart = async (req,res) => {
    try{
        //code
        // req.suer.id ผ่าน Middle ทุกๆหน้า ไม่ผ่าน middle จะใช้ตัวแปลไม่ได้
        const cart  = await prisma.cart.findFirst({
            where:{
                orderedById: Number(req.user.id)
            },
            include:{
                products:{
                    include:{
                        product:true
                    }
                }
            }
        })
        //console.log(cart)
        res.json({
            products: cart.products,
            cartTotal: cart.cartTotal
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "getUserCart Error"})
    }
}
exports.emptyCart = async (req,res) => {
    try{
        //code
        const cart = await prisma.cart.findFirst({
            where: { orderedById: Number(req.user.id)}
        })
        if(!cart){
            return res.status(400).json({ message : 'No Cart'})
        }
        await prisma.prouctOnCart.deleteMany({
            where: { cartId: cart.id}
        })
        const result = await prisma.cart.deleteMany({
            where:{ orderedById: Number(req.user.id)}
        })
    
        console.log(result)
        res.json({
            message : 'Cart Empty Success',
            deletedCount: result.count
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "emptyCart Error"})
    }
}
exports.saveAddress = async (req,res) => {
    try{
        //code
        const { address } = req.body
        console.log(address)
        const addressUser = await prisma.user.update({
            where:{
                id: Number(req.user.id)
            },
            data:{
                address: address
            }
        })
        res.json({
            Success : true ,
            message : "Address Update Success"
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "saveAddress Error"})
    }
}
exports.saveOrder = async (req, res) => {
 
  try {
    const userId = req.user.id;

    // ใช้ Transaction เพื่อความปลอดภัย (เช็คของ -> ตัดของ -> สร้างออเดอร์ -> ลบตะกร้า)
    // ถ้าขั้นตอนไหนพัง ข้อมูลจะ Rollback กลับมาเหมือนเดิมทั้งหมด
    const order = await prisma.$transaction(async (tx) => {
      
      // 1. ดึงข้อมูลตะกร้า
      const cart = await tx.cart.findFirst({
        where: { orderedById: userId },
        include: { products: { include: { product: true } } },
      });

      if (!cart || cart.products.length === 0) {
        throw new Error("Cart is empty");
      }

      // 2. (สำคัญ) เช็คสต็อก และ ตัดสต็อกสินค้าทีละรายการ
      for (const item of cart.products) {
        // 2.1 ดึงสินค้าล่าสุดเพื่อเช็ค quantity
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        // 2.2 เช็คว่ามีของพอไหม
        if (!product || item.count > product.quantity) {
          throw new Error(
            `ขออภัย สินค้า "${product?.title || 'Unknown'}" หมด หรือมีไม่พอ (เหลือ ${product?.quantity || 0} ชิ้น)`
          );
        }

        // 2.3 ตัดสต็อก (ลด quantity, เพิ่ม sold)
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: { decrement: item.count },
            sold: { increment: item.count }
          }
        });
      }

      // 3. สร้าง Order
      const newOrder = await tx.order.create({
        data: {
          orderedById: userId,
          cartTotal: cart.cartTotal,
          products: {
            create: cart.products.map((item) => ({
              productId: item.productId,
              count: item.count,
              price: item.price,
            })),
          },
          orderStatus: "Not Process", // สถานะจัดส่ง
          amount: cart.cartTotal,
          status: "Paid",             // สถานะการเงิน
          currentcy: "THB",
          stripePaymentId: "manual-payment", // ใส่ไว้ตามโครงสร้างเดิมของคุณ
        },
      });

      // 4. เคลียร์ Cart และ Items ใน Cart
      await tx.productOnCart.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.delete({ where: { id: cart.id } });

      return newOrder;
    });

    res.json({ message: "Order placed successfully", order });

  } catch (err) {
    console.log(err);
    // ถ้า Error เพราะสินค้าหมด ให้ส่งข้อความแจ้งเตือนกลับไป
    const message = err.message.includes("ขออภัย") ? err.message : "Order creation failed";
    res.status(500).json({ message: message });
  }
};
exports.getOrder = async (req,res) => {
  try{
      // ดึง orders ของ user และ include product + orderedBy
      const orders = await prisma.order.findMany({
          where: {
              orderedById: Number(req.user.id)
          },
          include: {
              products: {
                  include: {
                      product: true
                  }
              },
              orderedBy: true
          },
          orderBy: { createdAt: "desc" } // ใหม่สุดอยู่บน
      });

      if (orders.length === 0){  
          return res.status(400).json({ success: false , message: 'No orders' });
      }

      res.json({ success: true, orders });

  } catch (err) {
      console.log(err);
      res.status(500).json({ message: "getOrder Error" });
  }
}
