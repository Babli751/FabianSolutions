export interface CommontContext {
    title: string;
    description: string;
   
  }
  
export interface HeroSection {
    title: string;
    description: string;
    cta: string;
  }
  
export interface whoWeAreSection {
    title: string;
    description: string;
  }

export interface ValueItem {
  title: string;
  description: string;
  icon: string;
}

export interface OurValues {
  [key: string]: ValueItem;
}

export interface OurValuesSectionContent {
  sectionTitle: string; // used for the heading
  OurValues: OurValues;
}



export interface OurProcessStep {
  stepTitle: string;
  description: string;
}

export interface OurProcess {
  title: string;
  description: string;
  steps: {
    [key: string]: OurProcessStep;
  };
}

export interface Technologies {
    title: string;
    description: string;
  }

export interface Team {
  title: string;
  description: string;
  specialists: {
    [key: string]: {
      name: string;
      role: string;
      photo?: string;
      bio?: string;
      linkedin?: string;
      twitter?: string;
    };
  };
}

export interface CallToAction {
    title: string;
    description: string;
    buttonText: string;
  }