export interface Errors {
    SorryNoContentFound: string;
    TheBlogPostRemoved: string;
    BackToBlogs: string;
  }

export interface Links {
    Home: string;
    Services: string;
    About: string;
    Blogs: string;
    Contact: string;
    Help: string;
    Guide: string;
    FAQ: string;
    QuickLinks: string;
  }

export interface Services {
    [key: string]: {
     title: string;
     description: string;
    }
  }

export interface ServicesPage {
    ReadyToBringYourProjectToLife: string;
    heroSection: {
     title: string;
     content: string;
    }
  }


export interface CommontContext {
    title: string;
    description: string;
    ourBlogs: string;
    blogSubtitle: string;
    contactUs: string;
    Email: string;
    Phone: string;
    follow_us: string;
    ourServices: string;
    WeCraftScalableFastAndModernWebsitesThatElevateYourBusinessPresence: string;
    all_rights_reserved: string;
    readMore: string;
    LatestBlogPosts: string;
    FeaturedProjects: string;
    ServicesPage: ServicesPage
    ServiceCards: Services;
    Links: Links;
    Errors: Errors;
    
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
  [key: string]: ValueItem | string;
}

export interface OurValuesSectionContent {
  title: string; // used for the heading
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

export interface Translations {
  heroSection?: HeroSection;
  whoWeAreSection?: whoWeAreSection;
  OurValues?: OurValuesSectionContent;  // import or define this interface
  OurProcess?: OurProcess;
  TechnologiesSection?: Technologies;
  TeamSection?: Team;
  CallToAction?: CallToAction;
}
