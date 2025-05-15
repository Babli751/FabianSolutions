// src/components/commons/Sections/LatestBlogsSection.tsx
"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { fetchCommontContext } from "@/services/commonService";
import { fetchBlogs } from "@/services/BlogService";
import { Blog } from "@/types/blogs";
import { useNotification } from "@/context/NotificationContext";
import NotificationModal from "@/components/commons/Modals/NotificationModal";
import Loader from "../Loaders/Loader";
import BlogCard from "../Cards/BlogCard";
import { CommontContext } from "@/types/commons";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Navigation, Pagination, Autoplay } from "swiper/modules";

export default function LatestBlogsSection() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [translations, setTranslations] = useState<CommontContext | null>(null);
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
        console.log(error)
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

  const latestBlogs = blogs.slice(0, 10); // Only latest 10


  return (
    <>
      {/* Latest Blogs */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-gray-800 dark:text-white text-center">
          { translations?.LatestBlogPosts || "Latest Blog Posts"}
        </h2>

     <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            pagination={{ clickable: true }}
            navigation
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
            }}
            >
            {latestBlogs.map((blog, index) => (
               <SwiperSlide key={index}>
                <div className="mb-6 mt-2 h-full">
                    <BlogCard
                    id={blog.id}
                    title={blog.translations[pathLocale]?.title || blog.translations['en']?.title}
                    excerpt={blog.translations[pathLocale]?.excerpt || blog.translations['en']?.excerpt}
                    image={blog.cover}
                    slug={blog.slug}
                    locale={pathLocale}
                    />
                </div>
                </SwiperSlide>
            ))}
    </Swiper>

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
