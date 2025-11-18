import React from "react";
import { ShoppingCart } from "lucide-react";
import useEcomStore from "../../store/ecom-store";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";


const ProductCard = ({ item, showTitle = true, showDescription = true }) => {
  const actionAddtoCart = useEcomStore((state) => state.actionAddtoCart);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="border rounded-md shadow-md p-2 w-56">
        <div>
          {item.images && item.images.length > 0 ? (
            // <-- แก้ตรงนี้: ห่อรูปด้วย Link
            <Link to={`/product/${item.id}`}>
              <img
                src={item.images[0].url}
                className="rounded-md w-full h-24 object-cover hover:scale-110 hover:duration-500"
              />
            </Link>
          ) : (
            <div className="w-full h-24 bg-gray-300 rounded-md text-center flex items-center justify-center shadow">
              No Image
            </div>
          )}
        </div>

        <div className="py-3">
          {showTitle && (
            // <-- แก้ตรงนี้: ห่อชื่อสินค้าด้วย Link
            <Link to={`/product/${item.id}`}>
              <p className="text-xl hover:text-blue-600 cursor-pointer">{item.title}</p>
            </Link>
          )}
          {showDescription && (
            <p className="text-sm text-gray-500">{item.description}</p>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-bold">{item.price}</span>
          <button
            onClick={() => actionAddtoCart(item)}
            className="bg-blue-600 rounded-md p-2 hover:bg-blue-900 shadow-md"
          >
            <ShoppingCart />
          </button>
        </div>
      </div>
    </motion.div>
  );
};


export default ProductCard;
