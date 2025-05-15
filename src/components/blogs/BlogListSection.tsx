// src/components/blogs/bloListSection.tsx
"use client";
import { useEffect, useState } from "react";
import { usePathname, useParams, notFound } from "next/navigation";
import Image from "next/image";
import { fetchBlogDetails } from "@/services/BlogService";
import { useNotification } from "@/context/NotificationContext";
import { Blog } from "@/types/blogs";
import Loader from "../commons/Loaders/Loader";


export default function BlogListSection() {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  const { setNotification } = useNotification();

  const pathname = usePathname();
  const { slug } = useParams();
  const pathLocale = pathname.split("/")[1] || "en";

   useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [blogData] = await Promise.all([
          fetchBlogDetails(String(slug), pathLocale),
        ]);
        setBlog(blogData);
      } catch (error) {
        setNotification({ message: "Failed to fetch data.", type: "error" });
        console.error("Error loading blog:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pathLocale, setNotification, slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="100" color="#FACC15" />
      </div>
    );
  }

  if (!blog) return notFound();

  return (
    <>
     <article className="max-w-4xl mx-auto mt-30 px-4 py-10 text-gray-800 dark:text-gray-200">
      {/* Featured Image */}
      <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
        <Image
          src={blog.cover}
          alt={blog.translations[pathLocale].title}
          width={1200}
          height={600}
          className="w-full object-cover h-72 sm:h-96 rounded-xl"
          priority
        />
      </div>

      {/* Title */}
      <header>
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white leading-tight">
          {blog.translations[pathLocale].title}
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
    </>
  );
}