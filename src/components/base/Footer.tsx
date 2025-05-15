// src/components/base/Footer.tsx
"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

import { useLoader } from '@/context/LoaderContext';
import { useNotification } from '@/context/NotificationContext';
import { fetchCommontContext } from "@/services/commonService";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import Link from "next/link";
import { CommontContext, Services } from "@/types/commons";


export default function Footer() {
  type Service = Services[keyof Services];
  const [services, setServices] = useState<Service[]>([]);
  const [translations, setTranslations] = useState<CommontContext | null>(null);

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
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [pathLocale, setLoading, setNotification]); // Use pathLocale instead of locale

  const menuItems = [
  { label: translations?.Links?.Home || "Home", path: "" },
  { label: translations?.Links?.Services || "Services", path: "services" },
  { label: translations?.Links?.Blogs || "Blogs", path: "blogs" },
  { label: translations?.Links?.About || "About", path: "about" },
  { label: translations?.Links?.Contact || "Contact", path: "contact" }
];

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        
        {/* About Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">FabianTech</h2>
          <p className="text-sm">
            { translations?.WeCraftScalableFastAndModernWebsitesThatElevateYourBusinessPresence || ' We craft scalable, fast, and modern websites that elevate your business presence.' }
          </p>
        </div>

        {/* Быстрые ссылки */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {translations?.Links?.QuickLinks || "Быстрые ссылки"}
          </h2>
          <ul className="text-sm space-y-2">

             {menuItems.map((item, index) => (
            <li key={index}>
             <Link 
        href={`/${pathLocale ? pathLocale : 'en'}/${item.path}`}
        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        {item.label}
      </Link >
            </li>
          ))}

          </ul>
        </div>

       {/* Services Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{ translations?.Links?.Services || 'Services' }</h2>
        <ul className="text-cm grid grid-cols-2 gap-2">
          {services.map((service, index) => (
            <li key={index}>
              <a href="#" className="hover:text-blue-600 transition block">{service.title}</a>
            </li>
          ))}
        </ul>
      </div>

        {/* Social Media Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">{ translations?.follow_us ||'Follow Us'}</h2>
          <div className="flex justify-center md:justify-start space-x-4 text-lg">
            <a href="https://facebook.com" target="blank" className="hover:text-blue-600 transition" aria-label="Facebook"><FaFacebookF /></a>
            <a href="https://twitter.com" target="blank" className="hover:text-blue-400 transition" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://www.instagram.com/fabianacademy2024?igsh=MXF3djI0Z3hib2I2aw%3D%3D" target="blank" className="hover:text-pink-500 transition" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://linkedin.com" target="blank" className="hover:text-blue-700 transition" aria-label="LinkedIn"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t mt-10 pt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        &copy; 2025 FabianTech Solutions. {translations?.all_rights_reserved || 'All rights reserved.'}
      </div>
    </footer>
  );
}
