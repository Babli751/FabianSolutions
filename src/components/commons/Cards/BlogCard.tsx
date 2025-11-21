// src/components/commons/Cards/BlogCard.tsx
"use client";
import { useEffect, useState } from "react";
import { fetchCommontContext } from "@/services/commonService";
import { usePathname } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import NotificationModal from "../Modals/NotificationModal";
import Link from "next/link";
import { CommontContext } from "@/types/commons";
import Loader from "../Loaders/Loader";
import Image from "next/image";

interface BlogCardProps {
  id: number
  title: string;
  excerpt: string;
  image: string;
  slug: string;
  locale: string;
}

export default function BlogCard({
  id,
  title,
  excerpt,
  image,
  slug,
  locale,
}: BlogCardProps) {
    const [translations, setTranslations] = useState<CommontContext | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const pathLocale = pathname.split("/")[1] || "en";
    const { notification, setNotification, closeNotification } = useNotification();

  useEffect(() => {
    const loadData = async () => {
       setLoading(true);
      try {
        const [translationData] = await Promise.all([
          fetchCommontContext(pathLocale),
        ]);
        setTranslations(translationData);
      } catch (error) {
        setNotification({message: 'Failed to fetch data.', type: "error" });
         setLoading(false);
         console.error(error)
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pathLocale, setNotification]);

    const handleClose = () => {
    closeNotification();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="100" color="#FACC15" />
      </div>
    );
  }

  return (
    <>
    <article className="feature-card group">
      <Link href={`/${locale}/blogs/details/${slug}`}>
        <div className="relative group overflow-hidden rounded-t-2xl">
          {/* Image with border radius */}
          <Image
            src={image}
            alt={title + "-" + id}
            className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110"
            width={500}
            height={500}
            loading="lazy"
          />
          {/* Gradient overlay for a more modern feel */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition duration-300" />
        </div>
      </Link>
      <div className="p-6 space-y-4">
        {/* Title with larger font-size and text-shadow for a more impactful look */}
        <h2 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2 transition-colors duration-300 group-hover:text-blue-600">
          {title}
        </h2>
        {/* Excerpt with a little more space */}
        <p className="text-slate-600 line-clamp-3 mb-4 leading-relaxed">
          {excerpt}
        </p>
        {/* Read more button with better styling */}
        <Link
          href={`/${locale}/blogs/details/${slug}`}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-300 group-hover:gap-2"
        >
          {translations?.readMore || 'Read more'} 
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
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

