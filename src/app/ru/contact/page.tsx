// src/app/ru/contact/page.tsx
"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Loader from "@/components/commons/Loaders/Loader";
import { useNotification } from "@/context/NotificationContext";
import NotificationModal from "@/components/commons/Modals/NotificationModal";
import { FaEnvelope, FaPhone, FaInstagram, FaTwitter, FaFacebook, FaLinkedin } from "react-icons/fa";
import { fetchCommontContext } from "@/services/commonService";
import { CommontContext } from "@/types/commons";


export default function ContactPage() {
  const [translations, setTranslations] = useState<CommontContext | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const pathLocale = pathname.split("/")[1] || "en";
  const { notification, setNotification, closeNotification } = useNotification();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [translationData] = await Promise.all([
          fetchCommontContext(pathLocale),
        ]);
        setTranslations(translationData);
      } catch (error) {
        setLoading(false);
        setNotification({message: 'Failed to fetch data.', type: "error" });
        console.log(error)
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
     <section className="min-h-screen flex flex-col justify-center items-center bg-white px-6 py-20 max-w-4xl mx-auto dark:bg-gray-900">
      <h1 className="text-4xl font-semibold text-gray-900 mb-16 dark:text-gray-200">{ translations?.contactUs || "Contact Us" }</h1>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-12 text-gray-700 dark:text-gray-300">

        {/* E-posta */}
        <ContactCard icon={<FaEnvelope />} label={`${ translations?.Email || "E-mail" }`} value="hello@fabiantech.solutions" href="mailto:hello@fabiantech.solutions" />

        {/* Telefon */}
        <ContactCard icon={<FaPhone />} label={`${ translations?.Phone || "Phone" }`} value="+48 (788) 318 848" href="tel:+48788318848" />

    

        {/* Sosyal Medya */}
        <div className="flex flex-col space-y-4 sm:col-span-2">
          <p className="font-semibold text-gray-900 mb-2 dark:text-gray-200">{ translations?.follow_us || "Follow Us" }</p>
          <div className="flex space-x-6 text-gray-600 text-2xl dark:text-gray-400">
            <SocialIcon href="https://www.instagram.com/fabianacademy2024?igsh=MXF3djI0Z3hib2I2aw%3D%3D" ariaLabel="Instagram"><FaInstagram /></SocialIcon>
            <SocialIcon href="https://twitter.com/" ariaLabel="Twitter"><FaTwitter /></SocialIcon>
            <SocialIcon href="https://linkedin.com/" ariaLabel="LinkedIn"><FaLinkedin /></SocialIcon>
            <SocialIcon href="https://facebook.com/" ariaLabel="Facebook"><FaFacebook /></SocialIcon>
          </div>
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

function ContactCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  return (
    <div className="flex items-center space-x-4 border-b border-gray-200 pb-4 last:border-none dark:border-gray-700">
      <div className="text-indigo-600 text-3xl">{icon}</div>
      <div>
        <p className="text-sm uppercase tracking-wide font-medium text-gray-500 dark:text-gray-400">{label}</p>
        {href ? (
          <a href={href} className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition dark:text-gray-300 hover:dark:text-indigo-400">
            {value}
          </a>
        ) : (
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-300">{value}</p>
        )}
      </div>
    </div>
  );
}

function SocialIcon({ href, ariaLabel, children }: { href: string; ariaLabel: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-indigo-600 transition dark:hover:text-indigo-400"
    >
      {children}
    </a>
  );
}
