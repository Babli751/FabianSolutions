import Head from 'next/head';
import { usePathname } from 'next/navigation';

const SEOHead = ({ locale }: { locale: string }) => {
  const pathname = usePathname();
  const currentUrl = `https://fabiantech.solutions${pathname}`;

   const translations: { [key: string]: { [key: string]: string } } = {
    ru: {
      title: "FabianTech — Веб-разработка и цифровые решения",
      description: "Разрабатываем масштабируемые, быстрые и современные веб-сайты и приложения, чтобы вывести ваш бизнес на новый уровень.",
    },
    en: {
      title: "FabianTech — Web Development & Digital Solutions",
      description: "We craft scalable, fast, and modern websites and applications to elevate your business presence.",
    },
    tr: {
      title: "FabianTech — Web Geliştirme ve Dijital Çözümler",
      description: "İşletmenizi bir üst seviyeye taşıyan ölçeklenebilir, hızlı ve modern web siteleri geliştiriyoruz.",
    },
  };

  const { title, description } = translations[locale] || translations["en"];

  return (
    <Head>
      <meta name="apple-mobile-web-app-title" content="FabianTech" />
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="author" content="Rashad Naghiyev" />
      <meta name="linkedin" content="https://www.linkedin.com/in/rashad-naghiyev-73b181237/" />
      <meta name="keywords" content="FabianTech, Web Development, Digital Solutions, Software, App Development, scalable websites, fast websites, modern UI, веб-разработка, dijital çözümler" />
      <meta name="robots" content="index, follow" />
      <meta name="theme-color" content="#000000" />

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Multilingual hreflang tags */}
      <link rel="alternate" hrefLang="en" href={`https://fabiantech.solutions/en${pathname.slice(3)}`} />
      <link rel="alternate" hrefLang="ru" href={`https://fabiantech.solutions/ru${pathname.slice(3)}`} />
      <link rel="alternate" hrefLang="tr" href={`https://fabiantech.solutions/tr${pathname.slice(3)}`} />

      {/* Open Graph (OG) Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content="https://fabiantech.solutions/assets/images/og-banner.png" />
      <meta property="og:site_name" content="FabianTech" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="https://fabiantech.solutions/assets/images/og-banner.png" />

      {/* Favicons */}
      <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <meta name="apple-mobile-web-app-title" content="FabianTech" />
      <link rel="manifest" href="/site.webmanifest" />
    </Head>
  );
};

export default SEOHead;
