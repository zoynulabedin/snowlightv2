import { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { downloadMedia } from "../lib/utils";
import { EllipsisVertical } from "lucide-react";

// Define Video type for clarity
interface Video {
  id: string | number;
  title: string;
  artist?: string;
  thumbnailUrl?: string;
  duration?: string | number;
  views?: number;
  // Add other properties as needed
}

interface VideoMenuDropdownProps {
  video: Video;
  loadingSongId: string | number | null;
  loadingType: "playlist" | "favorite" | null;
  onToggleFavorite: (video: Video) => void;
  onDownload: (video: Video) => void;
}

export default function VideoMenuDropdown({
  video,
  loadingSongId,
  loadingType,
  onToggleFavorite,
  onDownload,
}: Omit<VideoMenuDropdownProps, "isFavorite" | "onMore">) {
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
      }); // 224px = w-56
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if ((e.target as HTMLElement).closest(".menu-dropdown-root")) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative menu-dropdown-root z-[99999999]">
      <button
        ref={buttonRef}
        className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="메뉴 열기"
      >
        <span className="w-5 h-5">
          <EllipsisVertical />
        </span>
      </button>
      {open &&
        ReactDOM.createPortal(
          <div
            className="bg-white border border-gray-200 rounded-lg shadow-lg py-2 w-56 z-[1200]"
            style={{
              position: "absolute",
              top: dropdownPos.top,
              left: dropdownPos.left,
              overflow: "visible",
            }}
          >
            <button
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap"
              onClick={() => {
                if (video?.videoUrl) {
                  downloadMedia(video.videoUrl, `${video.title}.mp4`);
                }
                setOpen(false);
              }}
              disabled={!video?.videoUrl}
            >
              download
            </button>
            <button
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap"
              onClick={() => {
                // Share logic
                setOpen(false);
              }}
            >
              Share
            </button>
            <button
              className={`flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap ${
                loadingSongId === video.id && loadingType === "favorite"
                  ? "cursor-wait"
                  : ""
              }`}
              onClick={() => {
                onToggleFavorite(video);
                setOpen(false);
              }}
              disabled={
                loadingSongId === video.id && loadingType === "favorite"
              }
            >
              you like
            </button>
            <hr className="my-2" />
            <button
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap"
              onClick={() => {
                // About the song logic
                setOpen(false);
              }}
            >
              About the song
            </button>
            <button
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap"
              onClick={() => {
                // Album Information logic
                setOpen(false);
              }}
            >
              Album Information
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
