// Navbar.tsx
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
import Link from "next/link";


const languages = [
  { code: "en", name: "English", flag: "/assets/flags/united-kingdom.png" },
  { code: "ru", name: "Русский", flag: "/assets/flags/russia.png" },
  { code: "tr", name: "Türkçe", flag: "/assets/flags/turkey.png" },
];

export default function Navbar() {
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [languageOpen, setLanguageOpen] = useState<boolean>(false);
  const [languageOpenMobile, setLanguageOpenMobile] = useState<boolean>(false);
  const [translations, setTranslations] = useState<any>(null);
  const { setLoading } = useLoader();
  const { setNotification } = useNotification();
  const pathname = usePathname();
  const router = useRouter();
  const locales = ["en", "ru", "tr"];

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
  }, [pathLocale]);

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
    const savedMode = localStorage.getItem('theme');
    const isDark =
      savedMode === 'dark' ||
      (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);


    useEffect(() => {
    const loadTranslations = async () => {
      setLoading(true);
      try {
        const data = await fetchCommontContext(pathLocale);
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

const menuItems = [
  { label: translations?.Links?.Home || "Home", path: "" },
  { label: translations?.Links?.Services || "Services", path: "services" },
  { label: translations?.Links?.Blogs || "Blogs", path: "blogs" },
  { label: translations?.Links?.About || "About", path: "about" },
  { label: translations?.Links?.Contact || "Contact", path: "contact" }
];

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 to-indigo-600 text-transparent bg-clip-text tracking-tight dark:from-blue-400 dark:to-indigo-400">
          fabiantech.solutions
        </h1>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-8 font-semibold text-lg">
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

        {/* Desktop Icons */}
        <div className="flex items-center gap-4">
          {/* Language Switcher (Visible only on Desktop and not in mobile menu) */}
        {!menuOpen && (
          <div ref={languageRefDesktop} className="relative hidden md:block">
            <button
              onClick={() => setLanguageOpen(!languageOpen)}
              className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {/* Display the current language flag instead of the globe */}
              <Image src={currentLanguage.flag} alt={currentLanguage.name} width={24} height={16} />
              <IoMdArrowDropdown className="inline-block" />
            </button>
            {languageOpen && <LanguageSwitcher setLanguageOpen={setLanguageOpen} />}
          </div>
        )}

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-xl text-gray-700 dark:text-gray-200 transition"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-2xl text-gray-700 dark:text-gray-200"
              aria-label="Toggle menu"
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen mobile menu */}
   {/* Fullscreen mobile menu */}
{menuOpen && (
  <div 
    className={`fixed top-0 left-0 w-screen h-screen bg-white dark:bg-gray-900 z-[999] flex flex-col items-start justify-start px-6 py-10 overflow-auto shadow-xl transition-transform duration-500 ease-in-out transform ${
      menuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
    }`}
  >
    <ul className="flex flex-col gap-6 text-2xl font-semibold text-gray-800 dark:text-white">
      {menuItems.map((item, index) => (
        <li key={index}>
             <Link
        href={`/${pathLocale ? pathLocale : 'en'}/${item.path}`}
        onClick={() => setMenuOpen(false)} 
       className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        {item.label}
      </Link>
       
        </li>
      ))}
    </ul>

    {/* Mobile Language Dropdown */}
    <div ref={languageRefMobile} className="flex flex-col gap-6 w-full items-start mt-6">
      <div className="relative w-full">
        <button 
          onClick={() => setLanguageOpenMobile(!languageOpenMobile)} 
          className="flex items-center gap-2 p-2 border rounded w-full dark:text-white dark:border-gray-600"
        >
          <Image 
            src={currentLanguage?.flag || "/assets/flags/united-kingdom.png"} // Default flag as fallback 
            alt={currentLanguage?.name || "English"} 
            width={24} 
            height={16} 
          />
          {currentLanguage?.name || "English"}
          <IoMdArrowDropdown />
        </button>
        {languageOpenMobile && <LanguageSwitcher setLanguageOpen={setLanguageOpenMobile} />}
      </div>
    </div>

    {/* Close Button */}
    <button 
      onClick={() => setMenuOpen(false)} 
      className="absolute top-6 right-6 text-3xl text-gray-700 dark:text-gray-200" 
      aria-label="Close Menu"
    >
      <FiX />
    </button>
  </div>
)}

    </nav>
  );
}
