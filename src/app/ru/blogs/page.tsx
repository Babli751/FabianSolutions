// src/app/blogs/page.tsx


"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Loader from "@/components/commons/Loaders/Loader";
import BlogCard from "@/components/commons/Cards/BlogCard";
import { fetchCommontContext } from "@/services/commonService";
import { fetchBlogs } from "@/services/BlogService";
import { Blog } from "@/types/blogs";
import { useNotification } from "@/context/NotificationContext";
import NotificationModal from "@/components/commons/Modals/NotificationModal";
import { CommontContext } from "@/types/commons";


export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [translations, setTranslations] = useState<CommontContext | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const pathLocale = pathname.split("/")[1] || "en";
  const { notification, setNotification, closeNotification } = useNotification();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [blogsData, translationData] = await Promise.all([
          fetchBlogs(),
          fetchCommontContext(pathLocale),
        ]);
        setBlogs(blogsData);
        setTranslations(translationData);
      } catch (error) {
        setLoading(false);
        setNotification({message: 'Failed to fetch data.', type: "error" });
        console.error(error)
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pathLocale, setNotification]);


    const handleClose = () => {
    closeNotification();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="100" color="#FACC15" />
      </div>
    );
  }

  return (
    <>
         {/* 🌟 Hero Section */}
     <section className="py-32 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden" style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-purple-900/50 to-indigo-900/60"></div>
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              {translations?.ourBlogs || "Our Blogs"}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              {translations?.blogSubtitle ||
              "Stay updated with the latest trends, tips, and insights from our team."}       
            </p>
          </div>
        </div>
      </section>

      {/* 📰 Blog Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, index) => (
              <BlogCard
                key={index}
                id={blog.id}
                title={blog.translations[pathLocale]?.title || blog.translations['en']?.title}
                excerpt={blog.translations[pathLocale]?.excerpt || blog.translations['en']?.excerpt}
                image={blog.cover}
                slug={blog.slug}
                locale={pathLocale}
              />
            ))}
          </div>
        </div>
      </section>

         {/* Notification Modal */}
   <NotificationModal
          isOpen={notification.isOpen}
          message={notification.message}
          type={notification.type}
  
          onClose={handleClose}
        />

    </>
  );
}
