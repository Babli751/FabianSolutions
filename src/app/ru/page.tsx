// src/app/ru/page.tsx
"use client";
import { useEffect, useState } from "react";
import Hero from '@/components/base/Hero';
import ServiceCard from '@/components/commons/Cards/ServiceCard';
import { useLoader } from '@/context/LoaderContext';
import { useNotification } from '@/context/NotificationContext';
import { fetchCommontContext } from "@/services/commonService";
import { fetchAboutPageContent } from "@/services/AboutService";
import { usePathname } from "next/navigation";
import NotificationModal from "@/components/commons/Modals/NotificationModal";
import TechnologiesSection from "@/components/commons/Sections/TechnologiesSection";
import TeamSection from "@/components/commons/Sections/TeamSection";
import CallToActionSection from "@/components/commons/Sections/CallToActionSection";
import LatestBlogsSection from "@/components/commons/Sections/LatestBlogsSection";
import ProjectsSection from "@/components/commons/Sections/ProjectsSection";
import { CommontContext, Translations, Services } from "@/types/commons";
import {
  FaCode,
  FaMobileAlt,
  FaPaintBrush,
  FaBullhorn,
  FaSearch,
  FaPlug,
  FaShoppingCart,
  FaTools,
  FaPalette
} from "react-icons/fa";

 
const iconMap: Record<string, React.ReactElement> = {
  "Веб-разработка": <FaCode />,
  "Мобильные приложения": <FaMobileAlt />,
  "UI/UX-дизайн": <FaPaintBrush />,
  "SMM (маркетинг в социальных сетях)": <FaBullhorn />,
  "SEO-оптимизация": <FaSearch />,
  "Разработка API": <FaPlug />,
  "Решения для электронной коммерции": <FaShoppingCart />,
  "Обслуживание и поддержка": <FaTools />,
  "Брендинг и фирменный стиль": <FaPalette />,
};

export default function Home() {
  type Service = Services[keyof Services];
  const [services, setServices] = useState<Service[]>([]);
  const [translations, setTranslations] = useState<CommontContext | null>(null);
  const [aboutTranslations, setAboutTranslations] = useState<Translations | null>(null);

  const { setLoading } = useLoader();
  const { notification, setNotification, closeNotification } = useNotification();
  const pathname = usePathname();
  const pathLocale = pathname.split("/")[1];

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      try {
        const [translationAboutData, commmonTranslationData] = await Promise.all([
          fetchAboutPageContent(pathLocale),
          fetchCommontContext(pathLocale),
        ]);
        const serviceData = Object.values(commmonTranslationData?.ServiceCards);
         setAboutTranslations(translationAboutData);
         setTranslations(commmonTranslationData);
         setServices(serviceData);
      } catch (error) {
        setLoading(false);
        setNotification({ message: 'Failed to load data.', type: 'error' });
        console.error(error)
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [pathLocale, setLoading, setNotification]);

   const handleClose = () => {
    closeNotification();
  };

  return (
    <>
      <Hero />
      <section id="services" className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-gray-400">{ translations?.ourServices|| 'Our Services'}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                icon={iconMap[service.title] || <FaCode />} // default icon
                title={service.title}
                description={service.description}
              />
            ))}
          </div>
        </div>
      </section>

    {/* Latest Blogs */}
    <ProjectsSection />

    {/* Latest Blogs */}
    <LatestBlogsSection />
        
    {/* Technologies */}
    <TechnologiesSection 
      title={aboutTranslations?.TechnologiesSection?.title || "Technologies We Use"}
      description={aboutTranslations?.TechnologiesSection?.description ||
            "We work with modern tools to build future-ready solutions"}
    />

      {/* Team Section */}
      <TeamSection 
      title={aboutTranslations?.TeamSection?.title || "Meet Our Team"}
      description={aboutTranslations?.TeamSection?.description || "A collective of specialists dedicated to digital excellence."}
      specialists={aboutTranslations?.TeamSection?.specialists || {}}
      />
      

      {/* Call to Action */}
      <CallToActionSection
          title={ aboutTranslations?.CallToAction?.title || "Ready to Work with Us?"}
          description={ aboutTranslations?.CallToAction?.description || "Let’s build something meaningful, together."}
          buttonText={ aboutTranslations?.CallToAction?.buttonText || "Contact Us"}
        />


      {/* Notification Modal */}
      <NotificationModal
              isOpen={notification.isOpen}
              message={notification.message}
              type={notification.type}
      
              onClose={handleClose}
            />
        
    </>
  );
}
