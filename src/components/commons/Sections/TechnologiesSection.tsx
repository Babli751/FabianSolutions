// src/components/commons/Sections/TechnologiesSection.tsx
import { motion } from 'framer-motion';
import { Technologies } from '@/types/commons';
import {
  SiNextdotjs,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiNodedotjs,
  SiPostgresql,
  SiMysql,
  SiFramer,
  SiPython,
  SiJavascript,
  SiGo,
  SiDocker,
  SiAmazonwebservices,
  SiGit,
  SiGithub,
  SiRedux,
  SiMongodb,
  SiFirebase,
  SiGraphql,
  SiVite,
  SiDjango,
  SiHtml5,
  SiCss3
} from "react-icons/si";

const technologies = [
  { name: "JavaScript", icon: <SiJavascript className="text-xl text-yellow-400" /> },
  { name: "TypeScript", icon: <SiTypescript className="text-xl text-blue-500" /> },
  { name: "Next.js", icon: <SiNextdotjs className="text-xl" /> },
  { name: "React", icon: <SiReact className="text-xl text-sky-500" /> },
  { name: "Redux", icon: <SiRedux className="text-xl text-purple-500" /> },
  { name: "Tailwind CSS", icon: <SiTailwindcss className="text-xl text-teal-400" /> },
  { name: "Node.js", icon: <SiNodedotjs className="text-xl text-green-500" /> },
  { name: "Python", icon: <SiPython className="text-xl text-green-500" /> },
  { name: "Django", icon: <SiDjango className="text-xl text-green-800" /> },
  { name: "Golang", icon: <SiGo className="text-xl text-blue-500" /> },
  { name: "PostgreSQL", icon: <SiPostgresql className="text-xl text-blue-700" /> },
  { name: "MySQL", icon: <SiMysql className="text-xl text-blue-600" /> },
  { name: "MongoDB", icon: <SiMongodb className="text-xl text-green-600" /> },
  { name: "Firebase", icon: <SiFirebase className="text-xl text-yellow-500" /> },
  { name: "GraphQL", icon: <SiGraphql className="text-xl text-pink-500" /> },
  { name: "Docker", icon: <SiDocker className="text-xl text-blue-400" /> },
  { name: "AWS", icon: <SiAmazonwebservices className="text-xl text-orange-400" /> },
  { name: "Git", icon: <SiGit className="text-xl text-red-500" /> },
  { name: "GitHub", icon: <SiGithub className="text-xl text-black dark:text-white" /> },
  { name: "Framer Motion", icon: <SiFramer className="text-xl text-pink-500" /> },
  { name: "Vite", icon: <SiVite className="text-xl text-purple-400" /> },
  { name: "HTML5", icon: <SiHtml5 className="text-xl text-orange-600" /> },
  { name: "CSS3", icon: <SiCss3 className="text-xl text-blue-600" /> },
];


export default function TechnologiesSection({ title, description }: Technologies) {
  return (
    <>
      {/* Technologies */}
      <section className="relative py-24 px-6 lg:px-32 bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-gray-950">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white"
          >
            {title}
          </motion.h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {technologies.map(({ name, icon }, index) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4, type: "spring" }}
              className="relative group"
            >
              <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/70 dark:bg-gray-800/60 backdrop-blur-md shadow-md border border-white/20 dark:border-gray-700 text-sm font-semibold text-gray-800 dark:text-white transition-transform transform-gpu hover:scale-105 hover:shadow-lg cursor-default">
                {icon}
                <span>{name}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Decorative floating elements */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-purple-300 opacity-20 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-52 h-52 bg-indigo-300 opacity-20 rounded-full blur-3xl -z-10 animate-pulse delay-200"></div>
      </section>
    </>
  );
}
