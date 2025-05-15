// src/app/en/blogs/page.tsx

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

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [translations, setTranslations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const pathLocale = pathname.split("/")[1] || "en";
  const { notification, setNotification, closeNotification } = useNotification();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [blogsData, translationData] = await Promise.all([
          fetchBlogs(),
          fetchCommontContext(pathLocale),
        ]);
        setBlogs(blogsData);
        setTranslations(translationData);
      } catch (error) {
        setNotification({message: 'Failed to fetch data.', type: "error" });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pathLocale]);

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
     <section className="max-w-6xl mt-30 mx-auto">
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-6">
                { translations?.ourBlogs || "Our Blogs"}

            </h1>
            <p className="text-center text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
                {translations?.blogSubtitle ||
                "Stay updated with the latest trends, tips, and insights from our team."}       
            </p>
      </section>

      {/* 📰 Blog Grid */}
      <section className="max-w-6xl mx-auto px-6 mt-16 mb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, index) => (
         <BlogCard
            key={index}
            title={blog.translations[pathLocale]?.title || blog.translations['en']?.title}
            excerpt={blog.translations[pathLocale]?.excerpt || blog.translations['en']?.excerpt}
            image={blog.cover}
            slug={blog.slug}
            locale={pathLocale}
          />

          ))}
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
