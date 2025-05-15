// src/components/commons/Section/OurValuesSection.tsx
import { motion } from 'framer-motion';
import { OurValues, OurValuesSectionContent } from '@/types/commons';

interface OurValuesSectionProps {
  sectionTitle: string
  translations: OurValuesSectionContent;
}


export default function OurValuesSection({ sectionTitle, translations }: OurValuesSectionProps) {
  return (
    <>
      {/* Our Values */}
      <section className="py-20 px-6 lg:px-32 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-extrabold text-center mb-12 tracking-tight dark:text-gray-200"
          >
            {sectionTitle}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {Object.entries(translations.OurValues || {})
  .filter(([key, value]) => typeof value === "object" && value !== null)
  .map(([key, value]) => (
    <motion.div
      key={key}
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="text-5xl mb-4">{value.icon}</div>
      <h3 className="text-xl font-semibold mb-2 dark:text-gray-100">{value.title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">{value.description}</p>
    </motion.div>
  ))
}
          </div>
        </div>
      </section>
    </>
  );
}
