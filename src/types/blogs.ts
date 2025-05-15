// types/blogs.ts 
export interface Translation {
  [key: string]: {
    title: string;
    excerpt: string;
    description: string;
    content?: string;
  }
}

export interface Blog {
  id: number;
  slug: string;
  cover: string;
  translations: Translation;
  published_at: string;
  content: string;
}
