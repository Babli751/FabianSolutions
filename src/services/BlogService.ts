 // services/blogService.ts
 import { Translation } from "@/types/blogs";
 import { Blog } from "@/types/blogs";
import blogsData from "@/../public/data/blogs.json";

const fetchBlogs = async (): Promise<Blog[]> => {
  try {
    const response = await fetch(`/data/blogs.json`);
    if (!response.ok) {
      throw new Error("Failed to fetch Blogs data");
    }
    const data = await response.json();
    console.log("fetched Blogs data:", data);
    // Convert the Blogs object to an array of Blog
    return Object.values(data.Blogs);
  } catch (error) {
    console.error("Error fetching Blogs:", error);
    throw error;
  }
};


const fetchBlogDetails = async (slug: string, locale: string): Promise<Blog | null> => {
  try {
    const blogs: any[] = Object.values(blogsData.Blogs || {});
    const blogData = blogs.find((b: any) => b.slug === slug);

    if (!blogData) return null;

     const selectedTranslation: Translation = blogData.translations?.[locale] 
      || Object.values(blogData.translations)?.[0] // fallback if locale missing

    const blog: Blog = {
      id: blogData.id,
      slug: blogData.slug,
      cover: blogData.cover,
      translations: selectedTranslation,
      published_at: blogData.published_at || new Date().toISOString(),
      content: blogData.content || "<p>No content available.</p>",
    };

    return blog;
  } catch (error) {
    console.error("Error fetching Blog by slug:", error);
    return null;
  }
};

  export {fetchBlogs};
  export {fetchBlogDetails};