import ProductCard from "./ProductCard";

export default function ProductSection() {
  const products = [
    {
      title: "Cure Mist Ayurvedic\nFirst Aid Wound Spray",
      size: "12.5 gm",
      price: "₹160",
      originalPrice: "₹168",
      discount: "5% Off",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/fae94d70951e579da8c813b13f1c188167fd8109?width=800",
      benefit: "Anti Fungal",
      form: "Spray",
      description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.",
    },
    {
      title: "Cure Mist Ayurvedic\nFirst Aid Wound Spray",
      size: "25 gm",
      price: "₹260",
      originalPrice: "₹271",
      discount: "5% Off",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/7476b81632a3d0afe4d9e250f707cf413f6e00bc?width=800",
      benefit: "Anti Fungal",
      form: "Spray",
      description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.",
    },
    {
      title: "Cure Mist Ayurvedic\nFirst Aid Wound Spray",
      size: "Combo",
      price: "₹418",
      originalPrice: "₹439",
      discount: "5% Off",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/77da10b4c39b1106d903e6b2abd1f3d612ea2828?width=800",
      benefit: "Anti Fungal",
      form: "Spray",
      description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.",
    },
  ];

  return (
    <section id="products" className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-24">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-[34px] font-bold text-black mb-2 md:mb-4">
            Most Trusted Wound Care Sprays
          </h2>
          <p className="text-base md:text-xl lg:text-[21px] font-medium text-black max-w-[813px] mx-auto leading-relaxed px-2">
            Fast relief for sports injuries & active lifestyles. Protects and heals scrapes, turf burns & workout wounds instantly.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 lg:gap-12">
          {products.map((product, index) => (
            <ProductCard
              key={index}
              title={product.title}
              size={product.size}
              price={product.price}
              originalPrice={product.originalPrice}
              discount={product.discount}
              image={product.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
