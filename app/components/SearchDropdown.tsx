import { useState, useRef, useEffect } from "react";
import { Link } from "@remix-run/react";
import { Search, Clock, Music, Album, User, Video } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";

interface SearchResult {
  songs: Array<{
    id: string;
    title: string;
    artist: string;
    album: string;
    imageUrl: string;
    duration: number;
  }>;
  albums: Array<{
    id: string;
    title: string;
    artist: string;
    imageUrl: string;
    releaseDate: Date;
    songCount: number;
  }>;
  artists: Array<{
    id: string;
    name: string;
    imageUrl: string;
    followers: number;
  }>;
  videos: Array<{
    id: string;
    title: string;
    artist: string;
    imageUrl: string;
    duration: number;
    views: number;
  }>;
}

interface SearchDropdownProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SearchDropdown({
  searchQuery,
  setSearchQuery,
  onSubmit,
}: SearchDropdownProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult>({
    songs: [],
    albums: [],
    artists: [],
    videos: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("Snowlight-recent-searches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (query: string) => {
    if (typeof window !== "undefined" && query.trim()) {
      const updated = [
        query,
        ...recentSearches.filter((s) => s !== query),
      ].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(
        "Snowlight-recent-searches",
        JSON.stringify(updated)
      );
    }
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("Snowlight-recent-searches");
    }
  };

  // Debounced search function
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setResults({ songs: [], albums: [], artists: [], videos: [] });
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsOpen(true);
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      setIsOpen(false);
      onSubmit(e);
    }
  };

  // Handle recent search click
  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    setIsOpen(false);
    saveRecentSearch(query);
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  // Handle result click
  const handleResultClick = (type: string, id: string, title: string) => {
    saveRecentSearch(title);
    setIsOpen(false);

    switch (type) {
      case "song":
        window.location.href = `/song/${id}`;
        break;
      case "album":
        window.location.href = `/album/${id}`;
        break;
      case "artist":
        window.location.href = `/artist/${encodeURIComponent(title)}`;
        break;
      case "video":
        window.location.href = `/video/${id}`;
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Format number
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const hasResults =
    results.songs.length > 0 ||
    results.albums.length > 0 ||
    results.artists.length > 0 ||
    results.videos.length > 0;
  const showRecentSearches =
    recentSearches.length > 0 && searchQuery.trim().length === 0;

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md mx-8">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={t("header.search_placeholder")}
          className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
        />
        <button
          type="submit"
          className="absolute right-1 top-1 bottom-1 px-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-green-500 rounded-full"></div>
              <span className="ml-2">{t("common.loading")}</span>
            </div>
          )}

          {/* Recent Searches */}
          {showRecentSearches && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">
                  {t("search.recent_searches")}
                </h4>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {t("search.clear")}
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="flex items-center space-x-2 w-full p-2 text-left hover:bg-gray-50 rounded"
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Search Results */}
          {searchQuery.trim().length >= 2 && !isLoading && (
            <>
              {/* Songs */}
              {results.songs.length > 0 && (
                <div className="border-t border-gray-100">
                  <div className="p-3 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                      <Music className="w-4 h-4 mr-2" />
                      {t("search.songs")}
                    </h4>
                  </div>
                  {results.songs.map((song) => (
                    <button
                      key={song.id}
                      onClick={() =>
                        handleResultClick("song", song.id, song.title)
                      }
                      className="flex items-center space-x-3 w-full p-3 text-left hover:bg-gray-50"
                    >
                      <img
                        src={song.imageUrl}
                        alt={song.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {song.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {song.artist} • {song.album}
                        </p>
                      </div>
                      {song.duration > 0 && (
                        <span className="text-xs text-gray-400">
                          {formatDuration(song.duration)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Albums */}
              {results.albums.length > 0 && (
                <div className="border-t border-gray-100">
                  <div className="p-3 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                      <Album className="w-4 h-4 mr-2" />
                      {t("search.albums")}
                    </h4>
                  </div>
                  {results.albums.map((album) => (
                    <button
                      key={album.id}
                      onClick={() =>
                        handleResultClick("album", album.id, album.title)
                      }
                      className="flex items-center space-x-3 w-full p-3 text-left hover:bg-gray-50"
                    >
                      <img
                        src={album.imageUrl}
                        alt={album.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {album.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {album.artist} • {album.songCount}{" "}
                          {t("search.tracks")}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(album.releaseDate).getFullYear()}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Artists */}
              {results.artists.length > 0 && (
                <div className="border-t border-gray-100">
                  <div className="p-3 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {t("search.artists")}
                    </h4>
                  </div>
                  {results.artists.map((artist) => (
                    <button
                      key={artist.id}
                      onClick={() =>
                        handleResultClick("artist", artist.id, artist.name)
                      }
                      className="flex items-center space-x-3 w-full p-3 text-left hover:bg-gray-50"
                    >
                      <img
                        src={artist.imageUrl}
                        alt={artist.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {artist.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatNumber(artist.followers)}{" "}
                          {t("search.followers")}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Videos */}
              {results.videos.length > 0 && (
                <div className="border-t border-gray-100">
                  <div className="p-3 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                      <Video className="w-4 h-4 mr-2" />
                      {t("search.videos")}
                    </h4>
                  </div>
                  {results.videos.map((video) => (
                    <button
                      key={video.id}
                      onClick={() =>
                        handleResultClick("video", video.id, video.title)
                      }
                      className="flex items-center space-x-3 w-full p-3 text-left hover:bg-gray-50"
                    >
                      <img
                        src={video.imageUrl}
                        alt={video.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {video.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {video.artist} • {formatNumber(video.views)}{" "}
                          {t("search.views")}
                        </p>
                      </div>
                      {video.duration > 0 && (
                        <span className="text-xs text-gray-400">
                          {formatDuration(video.duration)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {!hasResults && searchQuery.trim().length >= 2 && (
                <div className="p-4 text-center text-gray-500">
                  <p className="text-sm">
                    {t("search.no_results")} &quot;{searchQuery}&quot;
                  </p>
                  <p className="text-xs mt-1">{t("search.try_different")}</p>
                </div>
              )}

              {/* View All Results */}
              {hasResults && (
                <div className="border-t border-gray-100 p-3">
                  <Link
                    to={`/search?q=${encodeURIComponent(searchQuery)}`}
                    onClick={() => {
                      saveRecentSearch(searchQuery);
                      setIsOpen(false);
                    }}
                    className="block w-full text-center py-2 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    {t("search.view_all")} &quot;{searchQuery}&quot;
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
