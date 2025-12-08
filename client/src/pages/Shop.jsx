import React, { useEffect } from "react";
import ProductCard from "../components/card/ProductCard";
import useEcomStore from "../store/ecom-store";
import SearchCart from "../components/card/SearchCart";
import CartCard from "../components/card/CartCard";

const Shop = () => {
  const getProduct = useEcomStore((state) => state.getProduct);
  const products = useEcomStore((state) => state.products);

  useEffect(() => {
    getProduct();
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-6 p-5">
      {/* Sidebar */}
      <aside className="md:w-1/4 bg-gray-200 p-4 rounded-md shadow-md">
        <SearchCart />
      </aside>

      {/* Product Grid */}
      <main className="md:w-2/4 grid grid-cols-1 sm:grid-cols-3 gap-4 h-fit">
        {products.map((item, index) => (
          <ProductCard key={index} item={item} />
        ))}
      </main>

      {/* Cart */}
      <aside className="md:w-1/4 bg-gray-200 p-4 rounded-md shadow-md">
        <CartCard />
      </aside>
    </div>
  );
};

export default Shop;