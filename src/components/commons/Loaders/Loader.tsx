import React from "react";
import { useLoader } from "@/context/LoaderContext"; // Access loader context
import './Loader.css'
interface LoaderProps {
  size?: string; // Loader size
  color?: string; // Main glow color
}

const Loader: React.FC<LoaderProps> = ({ size = "80", color = "#4F46E5" }) => {
  const { loading } = useLoader(); // Get loading state from context

  if (!loading) return null; // Don't render the loader if not loading
  console.log(size, color)

  return (
    <div className="default-loader">
    <div className="loader-container">
      <div className="circle"></div>
      <div className="circle shadow"></div>
      <span className="loader-text">Loading...</span>
    </div>
</div>
  );
};

export default Loader;
