const prisma = require("../config/prisma")

exports.changeOrderStatus = async (req, res) => {
    try {
      const { orderId, orderStatus } = req.body;
      
      // 1. อัปเดตสถานะออเดอร์
      const orderUpdate = await prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: orderStatus },
        include: { products: true } // ดึงรายการสินค้ามาด้วย (เผื่อต้องคืนของ)
      });
  
      // 2. เพิ่ม Logic: คืนของในสต็อก ถ้าสถานะเป็น "Cancelled"
      if (orderStatus === 'Cancelled') {
        // วนลูปคืนสินค้าทีละรายการ
        for (const item of orderUpdate.products) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              quantity: { increment: item.count }, // + บวกของคืนสต็อก
              sold: { decrement: item.count }      // - ลบยอดขายออก
            }
          });
        }
      }
  
      res.json(orderUpdate);
  
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "changeOrderStatus Error" });
    }
  };
exports.getOrderAdmin = async (req,res) => {
    try{
        //code
        const orders = await prisma.order.findMany({
            include:{
                products: {
                    include:{
                        product: true
                    }
                },
                orderedBy :{
                    select:{
                        id: true,
                        email: true,
                        address: true
                    }
                }
            }
        })
        res.json(orders)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "getOrderAdmin Error"})
    }
}