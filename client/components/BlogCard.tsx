import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface BlogCardProps {
  id: string;
  image: string;
  title: string;
  date: string;
  excerpt: string;
}

const BlogCard = ({ id, image, title, date, excerpt }: BlogCardProps) => {
  return (
    <article className="flex flex-col">
      <div className="aspect-[4/3] overflow-hidden rounded-lg mb-4">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <h3 className="text-lg font-bold text-black leading-tight mb-2">
        {title}
      </h3>
      
      <p className="text-sm font-medium text-blog-date mb-3">
        {date}
      </p>
      
      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
        {excerpt}
      </p>
      
      <Link to={`/blog/${id}`}>
     <div className="flex justify-end mt-4">
     <Button 
      variant="outline" 
      className="border-2 bg-[#F5EEFF] text-black font-bold hover:bg-foreground hover:text-background transition-colors px-8"
    >
      READ MORE
    </Button>
  </div>
  </Link>


    </article>
  );
};

export default BlogCard;