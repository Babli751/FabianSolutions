// src/components/commons/Cards/ProjectCard.tsx

import Image from "next/image";

interface ProjectCardProps {
  id: number;
  slug: string;
  cover: string;
  translations: {
    title: string;
    description: string;
    excerpt: string;
  };
  published_at: string;
  tags: {
    [key: string]: {
      tagName: string;
    };
  };
}

export default function ProjectCard({ cover, translations, tags }: ProjectCardProps) {
  return (
    <div className="w-full sm:h-[340px] md:h-[400px] mb-15 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full">
      {/* Image */}
      <div className="relative h-56 w-full">
        <Image src={cover} alt={translations.title} layout="fill" objectFit="cover" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
          {translations.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {translations.description}
        </p>

        {/* Tags */}
        <div className="mt-auto flex flex-wrap gap-2">
          {Object.values(tags).map((tag, index) => (
            <span
              key={index}
              className="bg-yellow-200 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full"
            >
              {tag.tagName}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
