// src/components/Buttons/LanguageSwitcher
"use client";

import { useRouter, usePathname, useSearchParams  } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image"; // Import Image from Next.js

const languages = [
  { code: "en", name: "English", flag: "/assets/flags/united-kingdom.png" },
  { code: "ru", name: "Русский", flag: "/assets/flags/russia.png" },
  { code: "tr", name: "Türkçe", flag: "/assets/flags/turkey.png" },
];

const LanguageSwitcher = ({ setLanguageOpen }: { setLanguageOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // Current path
  const searchParams = useSearchParams(); // Get the search params

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const switchLanguage = (newLocale: string) => {
    // Get current parameters from the URL
    const params = searchParams ? searchParams.toString() : '';
    const newPath = `/${newLocale}${pathname.replace(/^\/[a-z]{2}/, "")}`; // Update the path to the new locale
    const fullPath = params ? `${newPath}?${params}` : newPath; // Append parameters to the path if any
    
    router.push(fullPath);
    setLanguageOpen(false); // Close dropdown after selecting a language
  };

  return (
    <div className="absolute bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 mt-2 w-32">
   {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLanguage(lang.code)}
          className="flex items-center gap-2 w-full text-left px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200"
        >
          <Image src={lang.flag} alt={lang.name} width={24} height={16} />
         
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
