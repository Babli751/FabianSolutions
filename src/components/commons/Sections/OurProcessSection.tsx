// src/components/commons/Sections/OurProcessSection.tsx
import { motion } from 'framer-motion';
import { OurProcessStep } from '@/types/commons';

interface OurProcessSectionProps {
  title: string;
  description: string;
  steps: {
    [key: string]: OurProcessStep;
  };
}

export default function OurProcessSection({ title, description, steps }: OurProcessSectionProps) {
  return (
    <section className="relative py-24 px-6 lg:px-32 bg-gradient-to-br from-white to-indigo-50 dark:from-gray-950 dark:to-gray-900 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center mb-20 z-10 relative">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white"
        >
          {title}
        </motion.h2>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
          {description}
        </p>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-14 z-10">
        {Object.entries(steps)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([_, step], i) => {
            const isEven = i % 2 === 0;
            return (
              <motion.div
                key={step.stepTitle}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                className={`relative bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow border-l-8 ${
                  isEven ? 'border-indigo-500' : 'border-purple-500'
                }`}
              >
                <div className="absolute -left-5 -top-5 w-10 h-10 bg-indigo-500 dark:bg-purple-600 text-white flex items-center justify-center rounded-full shadow-md font-bold">
                  {i + 1}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {step.stepTitle}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{step.description || ''}</p>
              </motion.div>
            );
          })}
      </div>

      {/* Optional background blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-200 opacity-20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-200 opacity-20 rounded-full blur-3xl -z-10"></div>
    </section>
  );
}
