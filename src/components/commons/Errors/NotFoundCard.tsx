// src/app/tr/blogs/details/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";

// Accepting props as an object
interface NotFoundCardProps {
  title: string;
  content: string;
  link: string;
  linkText: string;
}

export default function NotFoundCard({ title, content, link, linkText }: NotFoundCardProps) {
  return (
    <div className="flex flex-col mt-20 items-center justify-center min-h-[80vh] text-center px-6 py-10">
      <div className="relative w-full max-w-4xl h-72 sm:h-96 mb-8 shadow-2xl rounded-2xl overflow-hidden">
        <Image
          src="/assets/images/404-removebg-preview.png" // Make sure this is high-res (ideally 2400x1200 or above)
          alt="404 Not Found"
          width={500}
          height={500}
          className="object-cover object-center"
          priority
        />
      </div>

      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-xl">
        {content}
      </p>

      <Link
        href={link}
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl text-base font-medium shadow-lg hover:bg-blue-700 transition duration-200"
      >
        {linkText}
      </Link>
    </div>
  );
}
