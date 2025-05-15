// src/services/commonService.ts
import { CommontContext } from "@/types/commons";


interface ImageSlide {
    src: string;
    title: string;
    text: string;
  }
  
  const fetchSliders = async (locale: string): Promise<ImageSlide[]> => {
    // If no locale, use 'en' by default (do not check immediately)
    const currentLocale = locale || 'en'; // Fallback to 'en' if locale is not available
  
    try {
      const response = await fetch(`/locales/${currentLocale}/${currentLocale}.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch slider data');
      }
      const data = await response.json();
      return Object.values(data.Sliders); // Assuming the response has a 'Sliders' key
    } catch (error) {
      console.error("Error fetching sliders:", error);
      throw error; // Rethrow error to handle it in the component
    }
  };
  

  interface HIWStep {
    title: string;
    description: string;
  }
  
  interface HIWContents {
    title: string;
    description: string;
    steps: {
      step1: HIWStep;
      step2: HIWStep;
      step3: HIWStep;
    };
    cta: string;
  }
  
  const fetchHIW = async (locale: string): Promise<HIWContents> => {
    // If no locale, use 'en' by default (do not check immediately)
    const currentLocale = locale || 'en'; // Fallback to 'en' if locale is not available
  
    try {
      const response = await fetch(`/locales/${currentLocale}/${currentLocale}.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch howItWorks data');
      }
      const data = await response.json();
      return data.howItWorks; // Directly return the object
    } catch (error) {
      console.error("Error fetching howItWorks:", error);
      throw error;
    }
  };
  





  const fetchCommontContext = async (locale: string): Promise<CommontContext> => {
    // If no locale, use 'en' by default (do not check immediately)
    const currentLocale = locale || 'en'; // Fallback to 'en' if locale is not available
  
    try {
      const response = await fetch(`/locales/${currentLocale}/${currentLocale}.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch CommontContext data');
      }
      const data = await response.json();
      return data.CommontContext;
    } catch (error) {
      console.error("Error fetching CommontContext:", error);
      throw error;
    }
  };

  interface FaqContext {
    title: string;
    description: string;
  }

  const fetchFaqContext = async (locale: string): Promise<FaqContext> => {
    const currentLocale = locale || 'en'; // Fallback to 'en' if locale is not available
  
    try {
      const response = await fetch(`/locales/${currentLocale}/${currentLocale}-faq.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch Faq Context data');
      }
      const data = await response.json();
      return data.faq;
    } catch (error) {
      console.error("Error fetching Faq Context:", error);
      throw error;
    }
  };
  export { fetchCommontContext }
  export { fetchFaqContext }

  export { fetchSliders };
  export { fetchHIW };
  