// src/components/base/ServiceCard.tsx
"use client";
import { useEffect, useState } from "react";
import { fetchCommontContext } from "@/services/commonService";
import { usePathname } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import NotificationModal from "../Modals/NotificationModal";
import Link from "next/link";


interface BlogCardProps {
  title: string;
  excerpt: string;
  image: string;
  slug: string;
  locale: string;
}

export default function BlogCard({
  title,
  excerpt,
  image,
  slug,
  locale,
}: BlogCardProps) {
    const [translations, setTranslations] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const pathLocale = pathname.split("/")[1] || "en";
    const { notification, setNotification, closeNotification } = useNotification();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [translationData] = await Promise.all([
          fetchCommontContext(pathLocale),
        ]);
        setTranslations(translationData);
      } catch (error) {
        setNotification({message: 'Failed to fetch data.', type: "error" });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pathLocale]);

    const handleClose = () => {
    closeNotification();
  };

  console.log("Title:", title)

  return (
    <>
    <article className="rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <Link href={`/${locale}/blogs/details/${slug}`}>
        <div className="relative group">
          {/* Image with border radius */}
          <img
            src={image}
            alt={title}
            className="w-full h-52 object-cover rounded-t-xl transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {/* Gradient overlay for a more modern feel */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent group-hover:bg-gradient-to-t group-hover:from-black group-hover:via-transparent group-hover:to-black opacity-30 transition duration-300" />
        </div>
      </Link>
      <div className="p-6 space-y-4">
        {/* Title with larger font-size and text-shadow for a more impactful look */}
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 line-clamp-2 transition-colors duration-300 hover:text-yellow-500">
          {title}
        </h2>
        {/* Excerpt with a little more space */}
        <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 text-lg">
          {excerpt}
        </p>
        {/* Read more button with better styling */}
        <Link
          href={`/${locale}/blogs/details/${slug}`}
          className="inline-block text-sm text-blue-600 hover:text-blue-500 font-semibold border-b-2 border-transparent hover:border-blue-500 transition-colors duration-300"
        >
      {translations?.readMore || 'Read more'} →
        </Link>
      </div>
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

