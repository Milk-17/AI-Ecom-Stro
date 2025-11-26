import React from "react";
import ContentCarousel from "../components/Home/ContentCarousel";
import BestSeller from "../components/Home/BestSeller";
import NewProduct from "../components/Home/NewProduct";

const Home = () => {
  return (
    <div className="p-6 space-y-10">
      {/* Banner */}
      <ContentCarousel rousel />

      {/* Best Seller Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-center">สินค้าขายดี</h2>
        <BestSeller />
      </section>

      {/* New Product Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-center">สินค้าใหม่</h2>
        <NewProduct />
      </section>
    </div>
  );
};

export default Home;