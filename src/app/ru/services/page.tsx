// src/app/ru/services/page.tsx

"use client";
import { FaCode, FaMobileAlt, FaPaintBrush } from "react-icons/fa";
import { useEffect, useState } from "react";
import { fetchCommontContext } from "@/services/commonService";
import { usePathname } from "next/navigation";
import Loader from "@/components/commons/Loaders/Loader";
import ServiceCard from "@/components/commons/Cards/ServiceCard";
import { useNotification } from "@/context/NotificationContext";
import NotificationModal from "@/components/commons/Modals/NotificationModal";


const iconMap: Record<string, React.ReactElement> = {
  "Web Development": <FaCode />,
  "Mobile Apps": <FaMobileAlt />,
  "UI/UX Design": <FaPaintBrush />,
};

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [translations, setTranslations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const pathLocale = pathname.split("/")[1] || "en";
  const { notification, setNotification, closeNotification } = useNotification();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCommontContext(pathLocale);
        const serviceData = Object.values(data?.ServiceCards || {});
        setTranslations(data);
        setServices(serviceData);
      } catch (error) {
        setNotification({message: 'Failed to fetch data.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pathLocale]);

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
            { translations?.ServicesPage?.heroSection?.title || 'Our Services'}

        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
             { translations?.ServicesPage?.heroSection?.content || 'We offer tailored digital solutions to bring your ideas to life and help your business grow.'}
       
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      {/* CTA */}
      <section className="mt-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          { translations?.ServicesPage?.ReadyToBringYourProjectToLife || 'Ready to bring your project to life?'}
        </h2>
        <a
          href={`/${pathLocale}/contact`}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition"
        >
           { translations?.contactUs || 'Contact Us'}
        </a>
      </section>

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
