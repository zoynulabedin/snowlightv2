import { useState, useEffect, useRef } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useLanguage, Language } from "~/contexts/LanguageContext";

interface LanguageSwitcherProps {
  variant?: "header" | "sidebar";
  size?: "sm" | "md";
}

export default function LanguageSwitcher({
  variant = "header",
  size = "sm",
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: {
    code: Language;
    name: string;
    flag: string;
    nativeName: string;
  }[] = [
    { code: "ko", name: "Korean", flag: "🇰🇷", nativeName: "한국어" },
    { code: "en", name: "English", flag: "🇺🇸", nativeName: "English" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === language);

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Header variant (compact for top bar)
  if (variant === "header") {
    return (
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-1 px-2 py-1 text-gray-600 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-50 ${
            size === "sm" ? "text-xs" : "text-sm"
          }`}
          aria-label="Change language"
        >
          <Globe className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
          <span className="hidden sm:inline">{currentLanguage?.flag}</span>
          <span className="hidden md:inline">
            {currentLanguage?.code.toUpperCase()}
          </span>
          <ChevronDown
            className={`w-3 h-3 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
              <div className="py-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                      language === lang.code
                        ? "bg-green-50 text-green-700"
                        : "text-gray-700"
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <div className="flex-1">
                      <div className="font-medium">{lang.nativeName}</div>
                      <div className="text-xs text-gray-500">{lang.name}</div>
                    </div>
                    {language === lang.code && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-100 px-4 py-2">
                <div className="text-xs text-gray-500">
                  Language / 언어 설정
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Sidebar variant (original style)
  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-green-600 transition-colors rounded-md hover:bg-gray-50 w-full"
      >
        <Globe className="w-4 h-4" />
        <span className="flex-1 text-left">{currentLanguage?.nativeName}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors first:rounded-t-md last:rounded-b-md ${
                  language === lang.code
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700"
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="flex-1">{lang.nativeName}</span>
                {language === lang.code && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
