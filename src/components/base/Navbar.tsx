// Navbar.tsx
"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IoMdArrowDropdown } from "react-icons/io";
import LanguageSwitcher from "../commons/Buttons/LanguageSwitcher";
import Image from "next/image";
import { useLoader } from '@/context/LoaderContext';
import { useNotification } from '@/context/NotificationContext';
import { fetchCommontContext } from "@/services/commonService";
import { FiMenu, FiX } from 'react-icons/fi';
import Link from "next/link";
import { CommontContext } from "@/types/commons";

const languages = [
  { code: "en", name: "English", flag: "/assets/flags/united-kingdom.png" },
  { code: "ru", name: "Русский", flag: "/assets/flags/russia.png" },
  { code: "tr", name: "Türkçe", flag: "/assets/flags/turkey.png" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState<boolean>(false);
  const [languageOpenMobile, setLanguageOpenMobile] = useState<boolean>(false);
  const [translations, setTranslations] = useState<CommontContext | null>(null);
  const { setLoading } = useLoader();
  const { setNotification } = useNotification();
  const pathname = usePathname();
  const router = useRouter();
  const locales = useMemo(() => ["en", "ru", "tr"], []);

  // Refs for detecting clicks outside of dropdowns
  const languageRefDesktop = useRef<HTMLDivElement | null>(null);
  const languageRefMobile = useRef<HTMLDivElement | null>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (languageRefDesktop.current && !languageRefDesktop.current.contains(event.target as Node)) &&
        (languageRefMobile.current && !languageRefMobile.current.contains(event.target as Node))
      ) {
        setLanguageOpen(false);
        setLanguageOpenMobile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Extract locale from path
  const pathLocale = pathname.split("/")[1];

  // If locale is missing, redirect to "/en"
  useEffect(() => {
    if (!locales.includes(pathLocale)) {
      router.replace(`/en${pathname}`);
    }
  }, [pathLocale, locales, pathname, router]);

  const currentLanguage = languages.find((lang) => lang.code === pathLocale) || languages[0];

  // Disable body scroll when the mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden"; // Disable scrolling
    } else {
      document.body.style.overflow = "auto"; // Enable scrolling
    }

    return () => {
      document.body.style.overflow = "auto"; // Ensure scrolling is always re-enabled
    };
  }, [menuOpen]);



    useEffect(() => {
    const loadTranslations = async () => {
      setLoading(true);
      try {
        const data = await fetchCommontContext(pathLocale);
        setTranslations(data);
      } catch (error) {
        setNotification({ message: 'Failed to load content.', type: 'error' });
        console.error(error)
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [pathLocale, setLoading, setNotification]); // Use pathLocale instead of locale

const menuItems = [
  { label: translations?.Links?.Home || "Home", path: "" },
  { label: translations?.Links?.Services || "Services", path: "services" },
  { label: "LeadGen", path: "leadgen" },
  { label: translations?.Links?.Blogs || "Blogs", path: "blogs" },
  { label: translations?.Links?.About || "About", path: "about" },
  { label: translations?.Links?.Contact || "Contact", path: "contact" }
];

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 to-indigo-600 text-transparent bg-clip-text tracking-tight">
          FabianTech
        </h1>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-8 font-semibold text-lg">
          {menuItems.map((item, index) => (
            <li key={index}>
             <Link 
        href={`/${pathLocale ? pathLocale : 'en'}/${item.path}`}
        className="hover:text-blue-600 transition-colors"
      >
        {item.label}
      </Link >
            </li>
          ))}
        </ul>

        {/* Desktop Icons */}
        <div className="flex items-center gap-4">
          {/* Sign In & Sign Up Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href={`/${pathLocale}/signin`}
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
            >
              {translations?.Links?.SignIn || "Sign In"}
            </Link>
            <Link
              href={`/${pathLocale}/signup`}
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {translations?.Links?.SignUp || "Sign Up"}
            </Link>
          </div>

          {/* Language Switcher (Visible only on Desktop and not in mobile menu) */}
        {!menuOpen && (
          <div ref={languageRefDesktop} className="relative hidden md:block">
            <button
              onClick={() => setLanguageOpen(!languageOpen)}
              className="text-lg font-semibold text-gray-800 flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 transition-all duration-200 shadow-sm"
            >
              {/* Display the current language flag instead of the globe */}
              <Image src={currentLanguage.flag} alt={currentLanguage.name} width={24} height={16} className="rounded-sm" />
              <span className="text-sm">{currentLanguage.name}</span>
              <IoMdArrowDropdown className="inline-block text-gray-600" />
            </button>
            {languageOpen && <LanguageSwitcher setLanguageOpen={setLanguageOpen} />}
          </div>
        )}

      

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-2xl text-gray-700"
              aria-label="Toggle menu"
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen mobile menu */}

      {menuOpen && (
        <div 
          className={`fixed top-0 left-0 w-screen h-screen bg-white z-[999] flex flex-col items-start justify-start px-6 py-10 overflow-auto shadow-xl transition-transform duration-500 ease-in-out transform ${
            menuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
        >
          <ul className="flex flex-col gap-6 text-2xl font-semibold text-gray-800">
            {menuItems.map((item, index) => (
              <li key={index}>
                  <Link
              href={`/${pathLocale ? pathLocale : 'en'}/${item.path}`}
              onClick={() => setMenuOpen(false)} 
            className="hover:text-blue-600 transition-colors"
            >
              {item.label}
            </Link>
            
              </li>
            ))}
          </ul>

          {/* Mobile Auth Buttons */}
          <div className="flex flex-col gap-3 w-full mt-8">
            <Link
              href={`/${pathLocale}/signin`}
              onClick={() => setMenuOpen(false)}
              className="w-full px-6 py-3 text-center text-base font-semibold text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
            >
              {translations?.Links?.SignIn || "Sign In"}
            </Link>
            <Link
              href={`/${pathLocale}/signup`}
              onClick={() => setMenuOpen(false)}
              className="w-full px-6 py-3 text-center text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md"
            >
              {translations?.Links?.SignUp || "Sign Up"}
            </Link>
          </div>

          {/* Mobile Language Dropdown */}
          <div ref={languageRefMobile} className="flex flex-col gap-6 w-full items-start mt-6">
            <div className="relative w-full">
              <button
                onClick={() => setLanguageOpenMobile(!languageOpenMobile)}
                className="flex items-center gap-3 p-4 border border-gray-300 rounded-xl w-full text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 shadow-sm"
              >
                <Image
                  src={currentLanguage?.flag || "/assets/flags/united-kingdom.png"} // Default flag as fallback
                  alt={currentLanguage?.name || "English"}
                  width={24}
                  height={16}
                  className="rounded-sm"
                />
                <span className="text-lg font-medium text-gray-800">{currentLanguage?.name || "English"}</span>
                <IoMdArrowDropdown className="ml-auto text-gray-600" />
              </button>
              {languageOpenMobile && <LanguageSwitcher setLanguageOpen={setLanguageOpenMobile} />}
            </div>
          </div>

          {/* Close Button */}
          <button 
            onClick={() => setMenuOpen(false)} 
            className="absolute top-6 right-6 text-3xl text-gray-700" 
            aria-label="Close Menu"
          >
            <FiX />
          </button>
        </div>
      )}

    </nav>
  );
}
