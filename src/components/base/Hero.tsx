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
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: `url(${slides[current].src})`,
        }}
      />

      {/* Black Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
          {slides[current].title}
        </h1>
        <p className="text-lg md:text-xl mb-6 animate-fade-in delay-100">
          {slides[current].text}
        </p>
        <a
          href="#services"
          className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
        >
          {buttonText}
        </a>
      </div>

      {/* Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 text-white text-2xl md:text-3xl p-3 bg-black/40 hover:bg-black/60 rounded-full"
        aria-label="Previous Slide"
      >
        <FaChevronLeft />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 text-white text-2xl md:text-3xl p-3 bg-black/40 hover:bg-black/60 rounded-full"
        aria-label="Next Slide"
      >
        <FaChevronRight />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
        {slides.map((_, index) => (
          <span
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
              index === current ? "bg-white" : "bg-white/40"
            }`}
          ></span>
        ))}
      </div>
    </section>
  );
}
