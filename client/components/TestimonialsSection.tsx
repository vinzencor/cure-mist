export default function TestimonialsSection() {
  const testimonials = [
    {
      video: "/testimonials/testimonial1.mp4",
    },
  ];

  return (
    <section className="py-12 md:py-20 lg:pt-28 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-24">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-[34px] font-bold text-black mb-4">
            Customer's Testimonials
          </h2>
          <p className="text-base md:text-xl lg:text-[21px] font-medium text-black max-w-[860px] mx-auto leading-relaxed">
            Real experiences from people who trust CureMist for their everyday
            first-aid needs. See how our fast-acting, Ayurvedic spray has helped
            customers heal quicker, cleaner, and with complete convenience.
          </p>
        </div>

        {/* Testimonial Video */}
        <div className="flex justify-center">
          <div className="w-[260px] sm:w-[300px] md:w-[320px]">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-lg bg-black">
              <video
                src="/testimonials/testimonial1.mp4"
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
