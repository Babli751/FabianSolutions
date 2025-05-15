// src/app/[locale]/blogs/details/[slug]/page.tsx

"use client";
import { useEffect, useState } from "react";

import { usePathname, useParams } from "next/navigation";
import Image from "next/image";
import { fetchBlogDetails } from "@/services/BlogService";
import { Blog } from "@/types/blogs";
import { useLoader } from "@/context/LoaderContext";
import Loader from "@/components/commons/Loaders/Loader";
import NotFoundCard from "@/components/commons/Errors/NotFoundCard";
import NotificationModal from "@/components/commons/Modals/NotificationModal";
import { useNotification } from "@/context/NotificationContext";
import { fetchCommontContext } from "@/services/commonService";

export default function BlogDetails() {
  const pathname = usePathname();
  const { slug } = useParams();
  const pathLocale = pathname.split("/")[1] || "en";
  const { loading, setLoading } = useLoader();
  const [blog, setBlog] = useState<Blog | null>(null);
  const { notification, setNotification, closeNotification } = useNotification();
  const [translations, setTranslations] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [translationData] = await Promise.all([
          fetchCommontContext(pathLocale),
        ]);
        setTranslations(translationData);
      } catch (error) {
        setNotification({message: 'Failed to fetch data.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pathLocale]);

  const getBlogBySlug = async () => {
    setLoading(true);
    try {
      const response = await fetchBlogDetails(String(slug), pathLocale);
      console.log("response:", response)

      setBlog(response);
    } catch (error) {
      setNotification({message: 'Failed to fetch data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
    getBlogBySlug();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

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

if (!blog) {
  return (
    <NotFoundCard 
      title={`${translations?.Errors?.SorryNoContentFound || "Sorry, no content found"}`}
      content={`${translations?.Errors?.TheBlogPostRemoved || "The blog post you are looking for may not be available or may have been removed."}`}
      link={`/${pathLocale}/blogs`}
      linkText={`${ translations?.Errors?.BackToBlogs || "Back to Blogs"}`}
    />
  );
}


  return (
    <>
     <article className="max-w-4xl mx-auto mt-30 px-4 py-10 text-gray-800 dark:text-gray-200">
      {/* Featured Image */}
      <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
        <Image
          src={blog.cover}
          alt={blog.translations.title}
          width={1200}
          height={600}
          className="w-full object-cover h-72 sm:h-96 rounded-xl"
          priority
        />
      </div>

      {/* Title */}
      <header>
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white leading-tight">
          {blog.translations.title}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Published on {new Date(blog.published_at).toLocaleDateString(pathLocale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      {/* Content */}
      <section className="prose prose-lg dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: blog.content }} />
      </section>
    </article>

    
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

