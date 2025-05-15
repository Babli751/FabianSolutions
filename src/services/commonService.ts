// src/services/commonService.ts

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
      console.log("fetched HIW data:", data);
      return data.howItWorks; // Directly return the object
    } catch (error) {
      console.error("Error fetching howItWorks:", error);
      throw error;
    }
  };
  

  interface HowCanIMakeReservation {
    title: string;
    description1: string;
    description2: string;
  }
  
  const fetchHowCanIMakeReservation = async (locale: string): Promise<HowCanIMakeReservation> => {
    // If no locale, use 'en' by default (do not check immediately)
    const currentLocale = locale || 'en'; // Fallback to 'en' if locale is not available
  
    try {
      const response = await fetch(`/locales/${currentLocale}/${currentLocale}.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch HowCanIMakeReservation data');
      }
      const data = await response.json();
      console.log("fetched HowCanIMakeReservation data:", data);
      return data.HowCanIMakeReservation;
    } catch (error) {
      console.error("Error fetching HowCanIMakeReservation:", error);
      throw error;
    }
  };

  interface Services {
    title: string;
    description: string;
  }


  interface CommontContext {
    title: string;
    description: string;
    ServiceCards: Services;
  }

  const fetchCommontContext = async (locale: string): Promise<CommontContext> => {
    // If no locale, use 'en' by default (do not check immediately)
    const currentLocale = locale || 'en'; // Fallback to 'en' if locale is not available
  
    try {
      const response = await fetch(`/locales/${currentLocale}/${currentLocale}.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch CommontContext data');
      }
      const data = await response.json();
      console.log("fetched CommontContext data:", data);
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
      console.log("fetched Faq Context data:", data);
      return data.faq;
    } catch (error) {
      console.error("Error fetching Faq Context:", error);
      throw error;
    }
  };
  export { fetchCommontContext }
  export { fetchFaqContext }

  export { fetchHowCanIMakeReservation };
  export { fetchSliders };
  export { fetchHIW };
  