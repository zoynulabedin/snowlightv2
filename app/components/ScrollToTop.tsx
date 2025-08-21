import { useEffect, useState, useCallback } from "react";
import { ArrowUp } from "lucide-react";

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const checkScrollPosition = useCallback(() => {
    const scrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;
    setIsVisible(scrollPosition > 300);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check position immediately
    checkScrollPosition();

    // Add scroll listener
    window.addEventListener("scroll", checkScrollPosition);

    // Cleanup
    return () => window.removeEventListener("scroll", checkScrollPosition);
  }, [checkScrollPosition]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (typeof window === "undefined") return null;

  return (
    <button
      onClick={scrollToTop}
      className={`
        p-3 
        bg-gray-800 
        text-white 
        rounded-full 
        shadow-lg 
        hover:bg-gray-700 
        transition-all 
        duration-300 
        ease-in-out
        mb-10 
        mr-10
        ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }
      `}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};

export default ScrollToTop;
