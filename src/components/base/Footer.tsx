// src/components/base/Footer.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IoMdArrowDropdown } from "react-icons/io";
import LanguageSwitcher from "../commons/Buttons/LanguageSwitcher";
import Image from "next/image";
import { useLoader } from '@/context/LoaderContext';
import { useNotification } from '@/context/NotificationContext';
import { fetchCommontContext } from "@/services/commonService";
import { FiMenu, FiX, FiMoon, FiSun } from 'react-icons/fi';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  const [services, setServices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [translations, setTranslations] = useState<any>(null);
  const { setLoading } = useLoader();
  const { setNotification } = useNotification();
  const pathname = usePathname();


  const pathLocale = pathname.split("/")[1];

    useEffect(() => {
    const loadTranslations = async () => {
      setLoading(true);
      try {
        const data = await fetchCommontContext(pathLocale);
        const serviceData = Object.values(data?.ServiceCards);
        setServices(serviceData);
        setTranslations(data);
      } catch (error) {
        setNotification({ message: 'Failed to load content.', type: 'error' });
        setError("Failed to load content.");
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [pathLocale]); // Use pathLocale instead of locale
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        
        {/* About Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">WebServicePro</h2>
          <p className="text-sm">
            { translations?.WeCraftScalableFastAndModernWebsitesThatElevateYourBusinessPresence || ' We craft scalable, fast, and modern websites that elevate your business presence.' }
          </p>
        </div>

        {/* Services Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">{ translations?.Links?.Services ||'Services'}</h2>
          <ul className="text-sm space-y-2">
             {services.map((service, index) => (
                                    <li key={index}>
                                      <a href="#" className="hover:text-blue-600 transition">{service.title}</a>
                                      </li>

                        ))}
         
          </ul>
        </div>

        {/* Social Media Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">{ translations?.follow_us ||'Follow Us'}</h2>
          <div className="flex justify-center md:justify-start space-x-4 text-lg">
            <a href="https://facebook.com" className="hover:text-blue-600 transition" aria-label="Facebook"><FaFacebookF /></a>
            <a href="https://twitter.com" className="hover:text-blue-400 transition" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://instagram.com" className="hover:text-pink-500 transition" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://linkedin.com" className="hover:text-blue-700 transition" aria-label="LinkedIn"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t mt-10 pt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        &copy; 2025 Fabiantech Solutions. {translations?.all_rights_reserved || 'All rights reserved.'}
      </div>
    </footer>
  );
}
