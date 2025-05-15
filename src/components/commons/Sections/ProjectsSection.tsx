// src/components/commons/Section/ProjectsSection.tsx

"use client";
import { useEffect, useState } from "react";

import { usePathname } from "next/navigation";
import { fetchCommontContext } from "@/services/commonService";
import { fetchProjects } from "@/services/ProjectService";
import { Project } from "@/types/projects";
import { useNotification } from "@/context/NotificationContext";
import Loader from "../Loaders/Loader";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ProjectCard from "../Cards/ProjectCard";
import { CommontContext } from "@/types/commons";

export default function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [translations, setTranslations] = useState<CommontContext | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const pathLocale = pathname.split("/")[1] || "en";
  const { setNotification } = useNotification();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [projectData, translationData] = await Promise.all([
          fetchProjects(),
          fetchCommontContext(pathLocale),
        ]);

        // Convert object to array from structure like { project1: {...}, project2: {...} }
        const projectArray: Project[] = Object.values(projectData);
        setProjects(projectArray);
        setTranslations(translationData);
      } catch (error) {
        console.error("Error loading projects:", error);
        setNotification({ message: "Failed to fetch data.", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pathLocale, setNotification]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="100" color="#FACC15" />
      </div>
    );
  }

  return (
    <section className="py-20 px-6 bg-white dark:bg-gray-950">
      <div className="max-w-screen-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-gray-900 dark:text-white text-center">
          {translations?.FeaturedProjects || "Featured Projects"}
        </h2>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
        >
          {projects.map((project) => (
            <SwiperSlide key={project.id}>
              <div className="p-4 h-full">
                <ProjectCard
                  id={project.id}
                  slug={project.slug}
                  cover={project.cover}
                  published_at={project.published_at}
                  translations={project.translations[pathLocale]}
                  tags={project.tags}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

