import { Link } from "react-router-dom";
import { BreadcrumbList, BreadcrumbItem, BreadcrumbLink } from "./ui/breadcrumb";

interface HeroProps {
  title: string;
  subtitle?: string;
  breadcrumbItems?: { label: string; href?: string }[];
}

const BlogHero = ({ title, subtitle, breadcrumbItems = [] }: HeroProps) => {
  return (
    <section className="bg-gradient-to-r from-[#f5ce59] to-[#faebbf] py-16 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col items-center gap-6 pt-6">
          <BreadcrumbList className="mb-2">
            {breadcrumbItems.map((b, idx) => (
              <BreadcrumbItem key={idx}>
                {b.href ? (
                  <BreadcrumbLink asChild>
                    <Link to={b.href}>{b.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <span className="font-normal text-foreground">{b.label}</span>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-center mt-4">{title}</h1>
          {subtitle && <p className="text-foreground/80 max-w-2xl text-center">{subtitle}</p>}
        </div>
      </div>
    </section>
  );
};

export default BlogHero;
