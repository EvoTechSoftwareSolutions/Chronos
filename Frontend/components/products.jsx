import React from 'react';

function Products() {
  return (
    <section className="py-16 px-8 bg-black/50">
      <h3 className="text-3xl font-bold text-[#D4AF37] mb-8 text-center">Featured Products</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-[#1E1E1E] p-4 border border-gray-800 hover:border-[#D4AF37] rounded-lg transition group cursor-pointer">
            <div className="bg-gray-800 h-48 mb-4 rounded flex justify-center items-center">
              <span className="text-gray-500">Watch Image</span>
            </div>
            <h4 className="text-white text-lg group-hover:text-[#D4AF37] transition">Chronos Model {item}</h4>
            <p className="text-[#D4AF37] mt-2 font-bold">$2,999</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Products;
