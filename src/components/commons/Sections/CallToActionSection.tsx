// src/components/commons/Section/CallToActionSection.tsx
"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CallToAction } from "@/types/commons";



export default function CallToActionSection({title, description, buttonText}: CallToAction) {
    const pathname = usePathname();
    const pathLocale = pathname.split("/")[1] || "en";
  return (
    <>
      {/* Call to Action */}
      <section className="py-20 bg-indigo-700 text-white text-center px-6 dark:bg-indigo-900">
        <h2 className="text-3xl font-bold mb-4 dark:text-gray-400">{title}</h2>
        <p className="mb-6 text-lg dark:text-gray-400">{description}</p>
        <Link
          href={`/${pathLocale}/contact`}
          className="inline-block px-6 py-3 bg-white text-indigo-700 font-semibold rounded-full shadow hover:bg-gray-100 transition"
        >
         {buttonText}
        </Link>
      </section>
    </>
  );
}
