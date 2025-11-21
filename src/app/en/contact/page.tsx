// src/app/contact/page.tsx
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
     <section className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-6 py-32 relative overflow-hidden" style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-purple-900/50 to-indigo-900/60"></div>
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              {translations?.contactUs || "Contact Us"}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Get in touch with us to discuss your project and bring your ideas to life
            </p>
          </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-slate-700">

            {/* E-posta */}
            <ContactCard icon={<FaEnvelope />} label={`${translations?.Email || "E-mail"}`} value="javanshir.m@mail.ru" href="mailto:javanshir.m@mail.ru" />

            {/* Telefon */}
            <ContactCard icon={<FaPhone />} label={`${translations?.Phone || "Phone"}`} value="+48 (788) 318 848" href="tel:+48788318848" />

            {/* Sosyal Medya */}
            <div className="flex flex-col space-y-6 sm:col-span-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800 mb-6">{translations?.follow_us || "Follow Us"}</p>
                <div className="flex justify-center space-x-8 text-slate-600 text-3xl">
                  <SocialIcon href="https://www.instagram.com/fabianacademy2024?igsh=MXF3djI0Z3hib2I2aw%3D%3D" ariaLabel="Instagram"><FaInstagram /></SocialIcon>
                  <SocialIcon href="https://twitter.com/" ariaLabel="Twitter"><FaTwitter /></SocialIcon>
                  <SocialIcon href="https://linkedin.com/" ariaLabel="LinkedIn"><FaLinkedin /></SocialIcon>
                  <SocialIcon href="https://facebook.com/" ariaLabel="Facebook"><FaFacebook /></SocialIcon>
                </div>
              </div>
            </div>
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
    <div className="flex items-center space-x-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl hover:shadow-lg transition-all duration-300 group">
      <div className="text-blue-600 text-4xl bg-white p-4 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div>
        <p className="text-sm uppercase tracking-wide font-semibold text-slate-500 mb-1">{label}</p>
        {href ? (
          <a href={href} className="text-lg font-bold text-slate-800 hover:text-blue-600 transition-colors duration-300">
            {value}
          </a>
        ) : (
          <p className="text-lg font-bold text-slate-800">{value}</p>
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
      className="text-slate-600 hover:text-blue-600 transition-all duration-300 transform hover:scale-125 hover:-translate-y-1"
    >
      {children}
    </a>
  );
}
