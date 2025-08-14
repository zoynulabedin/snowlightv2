import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";

interface DropdownOption {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface DownloadDropdownProps {
  options: DropdownOption[];
  buttonLabel?: React.ReactNode;
  buttonClassName?: string;
  menuClassName?: string;
}

const DownloadDropdown: React.FC<DownloadDropdownProps> = ({
  options,
  buttonLabel = "다운로드",
  buttonClassName = "p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 focus:outline-none",
  menuClassName = "bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-56 z-[1200]",
}) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>(
    { top: 0, left: 0 }
  );

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - 224,
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if ((e.target as HTMLElement).closest(".download-dropdown-root")) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative download-dropdown-root">
      <button
        disabled={options?.length <= 0}
        ref={buttonRef}
        className={buttonClassName}
        onClick={() => setOpen((v) => !v)}
        aria-label="다운로드 메뉴 열기"
      >
        {buttonLabel}
      </button>
      {open &&
        ReactDOM.createPortal(
          <div
            className={menuClassName}
            style={{
              position: "absolute",
              top: dropdownPos.top,
              left: dropdownPos.left,
              overflow: "visible",
              zIndex: 9999,
            }}
          >
            {options.map((opt, idx) => (
              <button
                key={idx}
                className={`flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap ${
                  opt.disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => {
                  if (!opt.disabled) {
                    opt.onClick();
                    setOpen(false);
                  }
                }}
                disabled={opt.disabled}
              >
                {opt.icon && <span className="mr-2">{opt.icon}</span>}
                {opt.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};

export default DownloadDropdown;
