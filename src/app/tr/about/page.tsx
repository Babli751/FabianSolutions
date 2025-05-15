// src/app/tr/about/page.tsx

"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Loader from "@/components/commons/Loaders/Loader";
import { useNotification } from "@/context/NotificationContext";
import NotificationModal from "@/components/commons/Modals/NotificationModal";
import { fetchAboutPageContent } from "@/services/AboutService";
import AboutHeroSection from "@/components/commons/Sections/AboutHeroSection";
import WhoWeAreSection from "@/components/commons/Sections/WhoWeAreSection";
import OurValuesSection from "@/components/commons/Sections/OurValuesSection";
import OurProcessSection from "@/components/commons/Sections/OurProcessSection";
import TechnologiesSection from "@/components/commons/Sections/TechnologiesSection";
import TeamSection from "@/components/commons/Sections/TeamSection";
import CallToActionSection from "@/components/commons/Sections/CallToActionSection";

export default function AboutPage() {
  const [translations, setTranslations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const pathLocale = pathname.split("/")[1] || "en";
  const { notification, setNotification, closeNotification } = useNotification();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [translationData] = await Promise.all([
          fetchAboutPageContent(pathLocale),
        ]);
        setTranslations(translationData);
      } catch (error) {
        setNotification({message: 'Failed to fetch data.', type: "error" });
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
      {/* Hero */}
    <AboutHeroSection
      title={translations?.heroSection?.title || 'About Us'}
      description={translations?.heroSection?.description || 'We craft high-performance digital experiences and modern websites that drive results.'}
      cta={translations?.heroSection?.cta || 'Learn how we work'}
    />

      {/* Who We Are */}
    <WhoWeAreSection
      title={translations?.whoWeAreSection?.title || 'Who We Are'}
      description={translations?.whoWeAreSection?.description ||"We're a team of forward-thinking developers and designers. We believe technology should serve people—that's why we build clean, modern, accessible web solutions that elevate businesses and ideas."}
    />

      {/* Our Values */}
      <OurValuesSection 
      sectionTitle={translations?.OurValues.title || "Our Core Values"}
      translations={translations}
      />

      {/* Our Process */}
      <OurProcessSection
        title={translations?.OurProcess?.title || 'Our Process'}
        description={
          translations?.OurProcess?.description ||
          'We work with a clear, strategic process that ensures quality and transparency at every stage.'
        }
        steps={translations?.OurProcess?.steps || {}}
      />

      {/* Technologies */}
      <TechnologiesSection 
        title={translations?.TechnologiesSection?.title || "Technologies We Use"}
        description={translations?.TechnologiesSection?.description ||
              "We work with modern tools to build future-ready solutions"}
      />

        {/* Team Section */}
        <TeamSection 
        title={translations?.TeamSection?.title || "Meet Our Team"}
        description={translations?.TeamSection?.description || "A collective of specialists dedicated to digital excellence."}
        specialists={translations?.TeamSection.specialists || {}}
        />

      {/* Call to Action */}
      <CallToActionSection
         title={ translations?.CallToAction?.title || "Ready to Work with Us?"}
         description={ translations?.CallToAction?.description || "Let’s build something meaningful, together."}
         buttonText={ translations?.CallToAction?.buttonText || "Contact Us"}
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
