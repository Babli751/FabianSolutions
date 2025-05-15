// src/app/services/page.tsx

"use client";
import { useEffect, useState } from "react";
import { fetchCommontContext } from "@/services/commonService";
import { fetchAboutPageContent } from "@/services/AboutService";
import { usePathname } from "next/navigation";
import Loader from "@/components/commons/Loaders/Loader";
import ServiceCard from "@/components/commons/Cards/ServiceCard";
import { useNotification } from "@/context/NotificationContext";
import NotificationModal from "@/components/commons/Modals/NotificationModal";
import CallToActionSection from "@/components/commons/Sections/CallToActionSection";
import TechnologiesSection from "@/components/commons/Sections/TechnologiesSection";
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
  "Web Development": <FaCode />,
  "Mobile Apps": <FaMobileAlt />,
  "UI/UX Design": <FaPaintBrush />,
  "SMM (Social Media Marketing)": <FaBullhorn />,
  "SEO Optimization": <FaSearch />,
  "API Development": <FaPlug />,
  "E-commerce Solutions": <FaShoppingCart />,
  "Maintenance & Support": <FaTools />,
  "Branding & Identity": <FaPalette />,
};

export default function ServicesPage() {
  type Service = Services[keyof Services];
  const [services, setServices] = useState<Service[]>([]);
  const [commonTranslations, setCommonTranslations] =  useState<CommontContext | null>(null);
  const [aboutTranslations, setAboutTranslations] =  useState<Translations | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const pathLocale = pathname.split("/")[1] || "en";
  const { notification, setNotification, closeNotification } = useNotification();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [translationAboutData, commmonTranslationData] = await Promise.all([
          fetchAboutPageContent(pathLocale),
          fetchCommontContext(pathLocale),
        ]);
        const serviceData = Object.values(commmonTranslationData?.ServiceCards || {});
        setAboutTranslations(translationAboutData);
        setCommonTranslations(commmonTranslationData);
        setServices(serviceData);
      } catch (error) {
        setLoading(false)
        setNotification({message: 'Failed to fetch data.', type: "error" });
        console.error(error)
      } finally { 
        setLoading(false);
      }
    };

    loadData();
  }, [pathLocale, setNotification]);

        const handleClose = () => {
    closeNotification();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="100" color="#FACC15" />
      </div>
    );
  }

  return (
   <>
      <section className="max-w-6xl mt-30 mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-6">
            { commonTranslations?.ServicesPage?.heroSection?.title || 'Our Services'}

        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
             { commonTranslations?.ServicesPage?.heroSection?.content || 'We offer tailored digital solutions to bring your ideas to life and help your business grow.'}
       
        </p>

        <div className="grid grid-cols-1 mb-10 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {services.map((service, index) => (
                      <ServiceCard
                        key={index}
                        icon={iconMap[service.title] || <FaCode />} // default icon
                        title={service.title}
                        description={service.description}
                      />
                    ))}
        </div>
      </section> 

      {/* Technologies */}
      <TechnologiesSection 
            title={aboutTranslations?.TechnologiesSection?.title || "Technologies We Use"}
            description={aboutTranslations?.TechnologiesSection?.description ||
                  "We work with modern tools to build future-ready solutions"}
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
