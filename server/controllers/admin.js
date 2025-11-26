const prisma = require("../config/prisma")

exports.changeOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;

    // 1. ดึงออเดอร์เดิมมาดูก่อน (เพื่อเช็คสถานะเก่า)
    const originalOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { products: true }
    });

    // ป้องกัน: ถ้าออเดอร์เดิมมัน Cancelled อยู่แล้ว ไม่ต้องทำอะไร (กันคืนสต็อกเบิ้ล)
    if (originalOrder.orderStatus === 'Cancelled') {
       return res.status(400).json({ message: "ออเดอร์นี้ถูกยกเลิกไปแล้ว (คืนสต็อกไปแล้ว)" });
    }

    // 2. อัปเดตสถานะใหม่
    const orderUpdate = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: orderStatus },
      include: { products: true }
    });

    // 3. Logic คืนของ 
    if (orderStatus === 'Cancelled') {
      for (const item of orderUpdate.products) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            quantity: { increment: item.count },
            sold: { decrement: item.count }
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