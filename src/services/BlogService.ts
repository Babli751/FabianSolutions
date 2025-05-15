 // services/BlogService.ts
 import { Blog } from "@/types/blogs";
import blogsData from "@/../public/data/blogs.json";

const fetchBlogs = async (): Promise<Blog[]> => {
  try {
    const response = await fetch(`/data/blogs.json`);
    if (!response.ok) {
      throw new Error("Failed to fetch Blogs data");
    }
    const data = await response.json();
    return Object.values(data.Blogs);
  } catch (error) {
    console.error("Error fetching Blogs:", error);
    throw error;
  }
};


const fetchBlogDetails = async (slug: string, locale: string): Promise<Blog | null> => {
  try {
    const blogs: Blog[] = Object.values(blogsData.Blogs || {});
    const blogData = blogs.find((b: Blog) => b.slug === slug);

    if (!blogData) return null;

    console.log(locale)

    const blog: Blog = {
      id: blogData.id,
      slug: blogData.slug,
      cover: blogData.cover,
      translations:  blogData.translations,
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