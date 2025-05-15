"use client";
import { FaWhatsapp } from "react-icons/fa";
import { usePathname } from "next/navigation";

const WhatsAppButton: React.FC = () => {
    const pathname = usePathname();
     
  // Extract locale from path
  const pathLocale = pathname.split("/")[1];
  
  // Translation mapping for different languages
  const wpTranslations: { [key: string]: { [key: string]: string } } = {
    en: {
      makeBookingMessage: "Hello! I would like to receive information about your web services.",  
    },
    ru: {
      makeBookingMessage: "Здравствуйте! Я хотел бы получать информацию о ваших веб-услугах.",  
    },
    tr: {
      makeBookingMessage: "Merhaba! Web servisleriniz hakkında bilgi almak istiyorum.", 
    }
  };
  
  const locale = wpTranslations[pathLocale] || wpTranslations.en; // Default to English if no match
  const sendWhatsAppMessage = () => {
    // Construct the message
    const message = `${locale.makeBookingMessage}`;

    // Encode the message for URL compatibility
    const encodedMessage = encodeURIComponent(message);

    // Construct the WhatsApp URL
    const whatsappUrl = `https://wa.me/994507969241?text=${encodedMessage}`;

    // Open the WhatsApp link
    window.open(whatsappUrl, "_blank");
  };
  

  return (
    <button
      rel="noopener noreferrer"
      className={`fixed bottom-5 right-5 bg-green-500 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 opacity-100 z-50`}
      onClick={sendWhatsAppMessage} 
    >
      <FaWhatsapp size={30} />
    </button>
  );
};

export default WhatsAppButton;
