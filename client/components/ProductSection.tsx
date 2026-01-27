import ProductCard from "./ProductCard";

export default function ProductSection() {
  const products = [
    {
      title: "Cure Mist Ayurvedic\nFirst Aid Wound Spray 12.5g",
      size: "12.5 gm",
      price: "₹160",
      originalPrice: "₹168",
      discount: "5% Off",
      image: "/Products/homeproduct1.png",
      images: ["/Products/Product1.0.png", "/Products/Product1.1.png"],
      benefit: "Anti Fungal",
      form: "Spray",
      description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.",
    },
    {
      title: "Cure Mist Ayurvedic\nFirst Aid Wound Spray 25g",
      size: "25 gm",
      price: "₹260",
      originalPrice: "₹271",
      discount: "5% Off",
      image: "/Products/homeproduct2.png",
      images: ["/Products/Product2.0.jpeg", "/Products/Product2.1.jpeg"],
      benefit: "Anti Fungal",
      form: "Spray",
      description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.",
    },
    {
      title: "Cure Mist Ayurvedic\nFirst Aid Wound Spray Combo(37.5g)",
      size: "Combo",
      price: "₹418",
      originalPrice: "₹439",
      discount: "5% Off",
      image: "/Products/homeproduct3.png",
      images: ["/Products/Product3.0.jpeg", "/Products/Product3.1.jpeg"],
      benefit: "Anti Fungal",
      form: "Spray",
      description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.",
    },
     {
      title: "Cure Mist Ayurvedic\nFirst Aid Wound Spray 50g",
      size: "50 gm",
      price: "₹345",
      originalPrice: "₹363",
      discount: "5% Off",
      image: "/Products/homeproduct4.png",
      images: ["/Products/Product4.0.png", "/Products/Product4.1.png"],
      benefit: "Anti Fungal",
      form: "Spray",
      description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.",
    },
  ];

  return (
    <section id="products" className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 md:px-6 lg:px-24">
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
        <div id="product-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-0 md:gap-x-2 lg:gap-x-0 gap-y-6 md:gap-y-12 lg:gap-y-16">
          {products.map((product, index) => (
            <ProductCard
              key={index}
              title={product.title}
              size={product.size}
              price={product.price}
              originalPrice={product.originalPrice}
              discount={product.discount}
              image={product.image}
              images={product.images}
              benefit={product.benefit}
              form={product.form}
              description={product.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
