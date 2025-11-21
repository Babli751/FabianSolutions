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
    <div className="absolute bg-white shadow-xl rounded-xl border border-gray-200 p-2 mt-2 w-40 z-50">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLanguage(lang.code)}
          className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 rounded-lg font-medium"
        >
          <Image src={lang.flag} alt={lang.name} width={24} height={16} className="rounded-sm" />
          <span className="text-sm">{lang.name}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
