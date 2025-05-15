// src/app/tr/page.tsx
"use client";
import { useEffect, useState } from "react";
import Hero from '@/components/base/Hero';
import ServiceCard from '@/components/commons/Cards/ServiceCard';
import { FaCode, FaMobileAlt, FaPaintBrush } from 'react-icons/fa';
import { useLoader } from '@/context/LoaderContext';
import { useNotification } from '@/context/NotificationContext';
import { fetchCommontContext } from "@/services/commonService";
import { usePathname } from "next/navigation";
import NotificationModal from "@/components/commons/Modals/NotificationModal";


const iconMap: Record<string, React.ReactElement> = {
  "Web Development": <FaCode />,
  "Mobile Apps": <FaMobileAlt />,
  "UI/UX Design": <FaPaintBrush />
  // Add more mappings here as needed
};

export default function Home() {
  const [services, setServices] = useState<any[]>([]);
  const [translations, setTranslations] = useState<any>(null);
  const { notification, setNotification, closeNotification } = useNotification();

  const { setLoading } = useLoader();
  const pathname = usePathname();
  const pathLocale = pathname.split("/")[1];

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      try {
        const data = await fetchCommontContext(pathLocale);
        const serviceData = Object.values(data?.ServiceCards);
        setTranslations(data);
        setServices(serviceData);
      } catch (error) {
        setNotification({ message: 'Failed to load data.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [pathLocale]);

        const handleClose = () => {
    closeNotification();
  };
  
  return (
    <>
      <Hero />
      <section id="services" className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-gray-400">{translations?.ourServices || 'Our Services'}</h2>
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
