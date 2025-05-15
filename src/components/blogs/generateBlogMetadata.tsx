// src/components/blogs/generateBlogMetadata.tsx
import { Metadata } from "next";
import { fetchBlogDetails } from "@/services/BlogService";

interface Props {
  params: { slug: string; locale: string };
}

export async function generateBlogMetadata({ params }: Props): Promise<Metadata> {
  // `params` are already resolved, no need to await them here
  const blog = await fetchBlogDetails(params.slug, params.locale);
  
  if (!blog) return {};

  return {
    title: blog.translations.title,
    description: blog.translations.excerpt,
    openGraph: {
      title: blog.translations.title,
      description: blog.translations.excerpt,
      images: [{ url: blog.cover }],
    },
  };
}