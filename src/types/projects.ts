// types/projects.ts 
export interface Translation {
  [key: string]: {
    title: string;
    excerpt: string;
    description: string;
  }
}

export interface Tags {
  [key: string]: {
    tagName: string;
  }
}

export interface Project {
  id: number;
  slug: string;
  cover: string;
  translations: Translation;
  tags: Tags;
  published_at: string;
}
