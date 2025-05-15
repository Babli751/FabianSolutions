import { HeroSection, whoWeAreSection, OurValues, OurProcess, TechnologiesSection, TeamSection, CallToAction } from "@/types/commons";


interface AboutPageProps {
    HeroSection: HeroSection;
    whoWeAreSection: whoWeAreSection;
    OurValues: OurValues;
    OurProcess: OurProcess;
    TechnologiesSection: TechnologiesSection;
    TeamSection: TeamSection;
    CallToAction: CallToAction;

}

 export const fetchAboutPageContent = async (locale: string): Promise<AboutPageProps> => {
    // If no locale, use 'en' by default (do not check immediately)
    const currentLocale = locale || 'en'; // Fallback to 'en' if locale is not available
  
    try {
      const response = await fetch(`/locales/${currentLocale}/about.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch fetchAboutPageContent data');
      }
      const data = await response.json();
      console.log("fetched fetchAboutPageContent data:", data);
      return data.AboutPageContent;
    } catch (error) {
      console.error("Error fetching fetchAboutPageContent:", error);
      throw error;
    }
  };