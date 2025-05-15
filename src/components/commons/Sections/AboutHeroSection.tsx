// src/components/commons/Section/AboutHeroSection.tsx
"use client";
import { usePathname } from "next/navigation";
import { motion } from 'framer-motion';
import { HeroSection } from '@/types/commons';


export default function AboutHeroSection({ title, description, cta }: HeroSection) {
      const pathname = usePathname();
      const pathLocale = pathname.split("/")[1] || "en";
  return (
    <>
      {/* Hero */}
      <section className="relative py-28 text-center bg-gradient-to-r from-indigo-600 to-purple-700 text-white overflow-hidden dark:bg-gray-950">
        {/* Decorative background blobs or waves */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute w-72 h-72 bg-white/10 rounded-full top-10 left-10 blur-3xl animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-white/10 rounded-full bottom-0 right-0 blur-2xl animate-ping"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 px-6"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight dark:text-gray-200">
           {title}
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/90 dark:text-gray-400">
           {description}
          </p>

          {/* Optional CTA */}
          <div className="mt-10">
            <a
              href={`/${pathLocale}/contact`}
              className="inline-block bg-white text-indigo-600 font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-gray-100 transition"
            >
             {cta}
            </a>
          </div>
        </motion.div>
      </section>
    </>
  );
}
