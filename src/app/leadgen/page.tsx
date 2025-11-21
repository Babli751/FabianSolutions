"use client";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

// Translation object
const translations = {
  en: {
    title: "Lead Generation Tool",
    subtitle: "Discover and connect with potential business partners",
    description: "Use our powerful lead generation platform to find businesses, manage contacts, and run email campaigns",
    runApp: "Run App",
    comingSoon: "How to use guide - Coming Soon"
  },
  tr: {
    title: "Potansiyel Müşteri Bulma Aracı",
    subtitle: "Potansiyel iş ortaklarını keşfedin ve bağlantı kurun",
    description: "İşletmeleri bulmak, kişileri yönetmek ve e-posta kampanyaları yürütmek için güçlü potansiyel müşteri bulma platformumuzu kullanın",
    runApp: "Uygulamayı Çalıştır",
    comingSoon: "Nasıl kullanılır rehberi - Yakında"
  },
  ru: {
    title: "Инструмент Генерации Лидов",
    subtitle: "Откройте и свяжитесь с потенциальными деловыми партнерами",
    description: "Используйте нашу мощную платформу генерации лидов для поиска бизнесов, управления контактами и проведения email кампаний",
    runApp: "Запустить Приложение",
    comingSoon: "Руководство по использованию - Скоро"
  }
};

export default function LeadGenLandingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const pathLocale = pathname.split("/")[1] || "en";
  const t = translations[pathLocale as keyof typeof translations] || translations.en;

  const handleRunApp = () => {
    router.push(`/${pathLocale}/leadgen/app`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section with Run App Button */}
      <div className="hero-gradient hero-pattern relative overflow-hidden min-h-screen flex items-center" style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-indigo-900/80"></div>

        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center text-white max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent animate-fade-in">
              {t.title}
            </h1>
            <p className="text-2xl md:text-3xl text-blue-100 mb-6 font-light">
              {t.subtitle}
            </p>
            <p className="text-lg md:text-xl text-blue-200 mb-12 max-w-3xl mx-auto">
              {t.description}
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 transform hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Google Maps Integration</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 transform hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Email Campaigns</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 transform hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Contact Management</span>
              </div>
            </div>

            {/* Run App Button */}
            <div className="flex justify-center">
              <button
                onClick={handleRunApp}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xl px-12 py-6 rounded-2xl shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-200"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t.runApp}</span>
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Empty section for future guide/gifs */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-blue-200">
            <svg className="w-20 h-20 mx-auto mb-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">{t.comingSoon}</h2>
            <p className="text-gray-600 text-lg">
              This section will contain step-by-step guides and animated tutorials showing you how to use the Lead Generation Tool effectively.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
