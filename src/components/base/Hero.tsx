"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNotification } from "@/context/NotificationContext";
import { useLoader } from "@/context/LoaderContext";
import Loader from "../commons/Loaders/Loader";

interface Slide {
  src: string;
  title: string;
  text: string;
}

interface RawSlide {
  src: string;
  title: string;
  text: string;
}

export default function Hero() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [buttonText, setButtonText] = useState("Explore Services");
  const { setNotification } = useNotification();
  const { loading, setLoading } = useLoader();
  const pathname = usePathname();
  const pathLocale = pathname.split("/")[1];

  useEffect(() => {
    const loadSlides = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/locales/${pathLocale || "en"}/${pathLocale || "en"}.json`);
        if (!response.ok) throw new Error("Failed to fetch slider data");
        const data = await response.json();

        const sliderValues = Object.entries(data.Sliders).filter(
          ([key]) => key.startsWith("slider")
        );

        const extractedSlides = sliderValues.map(([, value]) => {
        const slide = value as RawSlide;
        return {
          src: slide.src,
          title: slide.title,
          text: slide.text,
        };
      });

        setSlides(extractedSlides);
        setButtonText(data.Sliders.buttonText || "Explore Services");
      } catch (error) {
        setNotification({ message: "Failed to load content.", type: "error" });
        console.error(error)
      } finally {
        setLoading(false);
      }
    };

    loadSlides();
  }, [pathLocale, setLoading, setNotification]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const prevSlide = () => setCurrent(current === 0 ? slides.length - 1 : current - 1);
  const nextSlide = () => setCurrent(current === slides.length - 1 ? 0 : current + 1);

  if (loading || slides.length === 0) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 z-50">
          <Loader size="100" color="#FACC15" />
        </div>
      </div>
    );
  }

  return (
    <section className="relative h-[85vh] w-full overflow-hidden">
      {/* Background Image with Modern Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: `url(${slides[current].src})`,
        }}
      />

      {/* Modern Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-indigo-900/80 z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
            {slides[current].title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 animate-fade-in delay-100 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            {slides[current].text}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in delay-200">
            <a
              href="#services"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl shadow-lg"
            >
              {buttonText}
            </a>
            <a
              href="#contact"
              className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-white/30 hover:border-white/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>

      {/* Modern Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 z-30 text-white text-2xl md:text-3xl p-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
        aria-label="Previous Slide"
      >
        <FaChevronLeft />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 z-30 text-white text-2xl md:text-3xl p-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
        aria-label="Next Slide"
      >
        <FaChevronRight />
      </button>

      {/* Modern Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-4 h-4 rounded-full cursor-pointer transition-all duration-300 shadow-lg ${
              index === current 
                ? "bg-white scale-125 shadow-xl" 
                : "bg-white/40 hover:bg-white/60 hover:scale-110"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </section>
  );
}
