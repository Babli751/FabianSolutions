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
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white text-center px-6 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="mb-8 text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
          <Link
            href={`/${pathLocale}/contact`}
            className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-2xl hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-3xl"
          >
           {buttonText}
          </Link>
        </div>
      </section>
    </>
  );
}
