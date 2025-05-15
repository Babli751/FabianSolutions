// src/components/blogs/bloListSection.tsx
"use client";
import { usePathname, useParams, notFound } from "next/navigation";
import Image from "next/image";
import { fetchBlogDetails } from "@/services/BlogService";
import { Blog } from "@/types/blogs";




export default async function BlogListSection() {
  // `params` are already available here, no need to await them
  const pathname = usePathname();
  const { slug } = useParams();
  const pathLocale = pathname.split("/")[1] || "en";
  const blog: Blog | null = await fetchBlogDetails(String(slug), pathLocale);

  if (!blog) return notFound();

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
    </>
  );
}