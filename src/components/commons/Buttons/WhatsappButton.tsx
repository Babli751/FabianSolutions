"use client";
import { FaWhatsapp } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const WhatsAppButton: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const locales = ["en", "ru", "tr"];
     
  // Extract locale from path
  const pathLocale = pathname.split("/")[1];
  
  // Translation mapping for different languages
  const wpTranslations: { [key: string]: { [key: string]: string } } = {
    en: {
      makeBookingMessage: "Hello! I would like to make a booking.",  
    },
    ru: {
      makeBookingMessage: "Здравствуйте! Я хотел бы сделать бронирование.",  
    },
    tr: {
      makeBookingMessage: "Merhaba! Rezervasyon yaptırmak istiyorum.", 
    }
  };
  
  const locale = wpTranslations[pathLocale] || wpTranslations.en; // Default to English if no match
  const sendBookingDetailsToWhatsApp = () => {
    // Construct the message
    const message = `${locale.makeBookingMessage}`;

    // Encode the message for URL compatibility
    const encodedMessage = encodeURIComponent(message);

    // Construct the WhatsApp URL
    const whatsappUrl = `https://wa.me/905368873770?text=${encodedMessage}`;

    // Open the WhatsApp link
    window.open(whatsappUrl, "_blank");
  };
  

  return (
    <button
      rel="noopener noreferrer"
      className={`fixed bottom-5 right-5 bg-green-500 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 opacity-100 z-50`}
      onClick={sendBookingDetailsToWhatsApp} 
    >
      <FaWhatsapp size={30} />
    </button>
  );
};

export default WhatsAppButton;
