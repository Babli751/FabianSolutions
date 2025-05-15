// layout.tsx
'use client'
import "./globals.css"
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/base/Navbar";
import Footer from "@/components/base/Footer";
import { LoaderProvider } from '@/context/LoaderContext'; // Wrap the app with this
import { NotificationProvider } from '@/context/NotificationContext';
import Loader from '@/components/commons/Loaders/Loader';
import WhatsAppButton from "@/components/commons/Buttons/WhatsappButton";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const locales = ["en", "ru", "tr"];
  // Extract locale from path
  const pathLocale = pathname.split("/")[1];

  // If locale is missing, redirect to "/en"
  useEffect(() => {
    if (!locales.includes(pathLocale)) {
      router.replace(`/en${pathname}`);
    }
  }, [pathLocale]);



  return (
    <html lang={pathLocale || "en"} suppressHydrationWarning data-theme="dark">
      <body className="min-h-screen bg-white dark:bg-gray-800 text-black dark:text-white">
         <LoaderProvider>
     <NotificationProvider>
        <Navbar />
          <Loader />
           <WhatsAppButton />
      <main className="flex-grow">{children}</main>
      <Footer />
      </NotificationProvider>
          </LoaderProvider>
      </body>
    </html>
  );
};

export default Layout;
