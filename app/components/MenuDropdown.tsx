import { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { downloadMedia } from "../lib/utils";
import { EllipsisVertical } from "lucide-react";

// Import or define TrackWithCover type
// Example import (adjust the path as needed):
// import { TrackWithCover } from '../types/TrackWithCover';

interface TrackWithCover {
  id: string | number;
  title: string;
  artist: string;
  coverUrl?: string;
  // Add other properties as needed
}

interface MenuDropdownProps {
  song: TrackWithCover;
  isFavorite: boolean;
  isPlaylist: boolean;
  loadingSongId: string | number | null;
  loadingType: "playlist" | "favorite" | null;
  onToggleFavorite: (song: TrackWithCover) => void;
  onDownload: (song: TrackWithCover) => void;
  onMore: (song: TrackWithCover) => void;
}

export default function MenuDropdown({
  song,
  loadingSongId,
  loadingType,
  onToggleFavorite,
  onDownload,
}: Omit<MenuDropdownProps, "isFavorite" | "onMore">) {
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
    <div className="relative menu-dropdown-root shrink-0">
      <button
        ref={buttonRef}
        className="p-2 rounded-full shrink-0 bg-gray-100 text-gray-500 hover:bg-gray-200 focus:outline-none"
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
                // Add to playlist logic
                setOpen(false);
              }}
            >
              Add to playlist
            </button>
            <button
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap"
              onClick={() => {
                // Include in album logic
                setOpen(false);
              }}
            >
              Include them in my album
            </button>
            <button
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap"
              onClick={() => {
                if (song?.audioUrl) {
                  downloadMedia(song.audioUrl, `${song.title}.mp3`);
                }
                setOpen(false);
              }}
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
                loadingSongId === song?.id && loadingType === "favorite"
                  ? "cursor-wait"
                  : ""
              }`}
              onClick={() => {
                onToggleFavorite(song);
                setOpen(false);
              }}
              disabled={
                loadingSongId === song?.id && loadingType === "favorite"
              }
            >
              you like
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
