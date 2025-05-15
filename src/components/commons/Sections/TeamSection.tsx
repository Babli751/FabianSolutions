// src/components/commons/Sections/TeamSection.tsx
import { motion } from 'framer-motion';
import { Team } from '@/types/commons';
import Image from 'next/image';

export default function TeamSection({ title, description, specialists }: Team) {
 
  return (
    <>
        {/* Team Section */}
        <section className="py-24 px-6 lg:px-32 bg-white dark:bg-gray-950">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl font-extrabold dark:text-gray-200">
              {title}
            </h2>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-400">
              {description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {Object.entries(specialists)
             .sort(([a], [b]) => a.localeCompare(b))
             .map(([_, member], i) => {
              console.log(_)
                return (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.5, type: "spring" }}
                    className="bg-gray-100 dark:bg-gray-900 rounded-3xl p-8 shadow-lg flex flex-col items-center text-center hover:shadow-2xl transition-shadow cursor-default"
                  >
                    {/* Placeholder or profile image */}
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-6 border-4 border-indigo-500 dark:border-indigo-400 shadow-md">
                      {member.photo ? (
                        <Image
                          src={member.photo}
                          alt={member.name}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-indigo-200 dark:bg-indigo-700 text-indigo-600 dark:text-indigo-300 font-bold text-3xl">
                          {member.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-4">
                      {member.role}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {member.bio || ""}
                    </p>

                    {/* Optional social links (if data exists) */}
                    <div className="mt-6 flex space-x-4">
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} LinkedIn`}
                          className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.762 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11.984 19.633h-2.803v-9.651h2.803v9.651zm-1.402-11.014c-.897 0-1.628-.731-1.628-1.632s.73-1.63 1.628-1.63c.898 0 1.628.73 1.628 1.63s-.73 1.632-1.628 1.632zm13.386 11.014h-2.797v-4.991c0-1.193-.024-2.729-1.663-2.729-1.666 0-1.922 1.302-1.922 2.646v5.074h-2.8v-9.651h2.688v1.317h.038c.375-.713 1.29-1.465 2.658-1.465 2.843 0 3.37 1.872 3.37 4.305v5.494z" />
                          </svg>
                        </a>
                      )}
                      {member.twitter && (
                        <a
                          href={member.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} Twitter`}
                          className="text-blue-400 hover:text-blue-600 transition"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M24 4.557a9.826 9.826 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.864 9.864 0 01-3.127 1.196 4.917 4.917 0 00-8.38 4.482 13.95 13.95 0 01-10.141-5.14 4.918 4.918 0 001.523 6.556 4.903 4.903 0 01-2.228-.616v.06a4.917 4.917 0 003.946 4.817 4.92 4.92 0 01-2.224.084 4.918 4.918 0 004.588 3.417 9.867 9.867 0 01-6.102 2.104c-.397 0-.79-.023-1.175-.068a13.945 13.945 0 007.548 2.212c9.056 0 14.01-7.5 14.01-14.01 0-.213-.005-.425-.014-.636a10.025 10.025 0 002.457-2.548l-.047-.02z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </section>
    </>
  );
}
