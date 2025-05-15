// src/components/blogs/generateBlogMetadata.tsx
import { Metadata } from "next";
import { fetchBlogDetails } from "@/services/BlogService";

export async function generateMetadata({ params }: { params: { slug: string, locale: string } }): Promise<Metadata> {
  const blog = await fetchBlogDetails(params.slug, params.locale);
  
  if (!blog) return {};

  const translation = blog.translations[params.locale];

  return {
    title: translation.title,
    description: translation.excerpt,
    openGraph: {
      title: translation.title,
      description: translation.excerpt,
      images: [{ url: blog.cover }],
    },
  };
}
