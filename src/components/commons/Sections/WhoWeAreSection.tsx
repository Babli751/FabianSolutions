// src/components/commons/Section/WhoWeAreSection.tsx
import { motion } from 'framer-motion';
import { whoWeAreSection } from '@/types/commons';

export default function WhoWeAreSection({ title, description }: whoWeAreSection) {

  return (
    <>
      {/* Who We Are */}
     <section className="relative py-20 px-6 lg:px-32 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Vertical accent line above title */}
            <div className="w-1 h-12 bg-indigo-600 mx-auto mb-6 rounded-full"></div>

            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight dark:text-gray-200">
              {title}
            </h2>

            <p className="text-gray-700 text-lg md:text-xl leading-relaxed dark:text-gray-400">
             {description}
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
