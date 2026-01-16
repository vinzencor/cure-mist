import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Share2 } from "lucide-react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { blogPosts } from "@/lib/blogs";
import { Button } from "@/components/ui/button";
import { BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from "@/components/ui/breadcrumb";


const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const post = blogPosts.find(p => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Blog post not found</p>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title.substring(0, 25) + "..." }
  ];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      
      {/* Breadcrumb Section */}
      <section className="bg-gradient-to-r from-[#F2B705] to-[#FFD147] py-4 md:py-6 px-4">
        <div className="container mx-auto px-4 md:px-6 lg:px-24">
          <BreadcrumbList className="mb-2 text-xs md:text-sm">
            {breadcrumbItems.map((b, idx) => (
              <BreadcrumbItem key={idx}>
                {b.href ? (
                  <BreadcrumbLink asChild>
                    <Link to={b.href}>{b.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{b.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </div>
      </section>

      <main className="flex-1 bg-background py-6 md:py-8 lg:py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-24 max-w-4xl">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold text-curemist-purple text-center mb-6 md:mb-8 leading-tight mt-4 md:mt-8">
            {post.title}
          </h1>

          {/* Featured Image */}
          <div className="aspect-video overflow-hidden rounded-lg mb-6 md:mb-8">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Meta Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8">
            <p className="text-xs md:text-sm font-medium text-blog-date">
              {post.date}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {post.content.map((paragraph, index) => (
              <div key={index} className="mb-6">
                {index > 0 && index % 2 === 0 && (
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
                    Sed ut perspiciatis unde omnis iste natus error sit
                  </h2>
                )}
                <p className="text-foreground/80 leading-relaxed">
                  {paragraph}
                </p>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8">
            <Button 
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto border-2 border-muted-foreground/30 text-foreground font-semibold hover:bg-muted px-12 py-6"
            >
              BACK
            </Button>
            
            <Button 
              onClick={handleShare}
              className="w-full sm:w-auto bg-curemist-purple hover:bg-curemist-purple/90 text-primary-foreground font-semibold px-8 py-6 flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              SHARE BLOG
            </Button>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default BlogDetail;
