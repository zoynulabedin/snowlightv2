import { useState, useRef } from "react";
import {
  Upload,
  Video,
  FileVideo,
  X,
  Check,
  AlertCircle,
  Play,
  Pause,
} from "lucide-react";

interface VideoUploaderProps {
  onUploadComplete: (result: UploadResult) => void;
  onUploadError: (error: string) => void;
}

interface UploadResult {
  url: string;
  public_id: string;
  duration?: number;
  [key: string]: any;
}

interface VideoFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  title: string;
  artist: string;
  description: string;
  genre: string;
  language: string;
  ageRating: string;
  cloudinaryUrl?: string;
  cloudinaryId?: string;
  error?: string;
  videoUrl?: string;
  duration?: number;
  thumbnailUrl?: string;
}

export default function VideoUploader({
  onUploadComplete,
  onUploadError,
}: VideoUploaderProps) {
  const [videoFiles, setVideoFiles] = useState<VideoFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const videoFiles = files.filter((file) => file.type.startsWith("video/"));

    if (videoFiles.length === 0) {
      onUploadError("Please select video files only");
      return;
    }

    const newVideoFiles: VideoFile[] = videoFiles.map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: "pending",
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: "",
      description: "",
      genre: "POP",
      language: "KO",
      ageRating: "",
    }));

    setVideoFiles((prev) => [...prev, ...newVideoFiles]);

    // Create video URLs for preview and get duration
    newVideoFiles.forEach((videoFile) => {
      const url = URL.createObjectURL(videoFile.file);
      setVideoFiles((prev) =>
        prev.map((vf) =>
          vf.id === videoFile.id ? { ...vf, videoUrl: url } : vf
        )
      );

      // Create video element for duration detection
      const video = document.createElement("video");
      video.src = url;
      video.addEventListener("loadedmetadata", () => {
        setVideoFiles((prev) =>
          prev.map((vf) =>
            vf.id === videoFile.id
              ? { ...vf, duration: Math.round(video.duration) }
              : vf
          )
        );
      });
    });
  };

  const updateVideoFile = (id: string, updates: Partial<VideoFile>) => {
    setVideoFiles((prev) =>
      prev.map((vf) => (vf.id === id ? { ...vf, ...updates } : vf))
    );
  };

  const removeVideoFile = (id: string) => {
    // Clean up video URL and ref
    const videoFile = videoFiles.find((vf) => vf.id === id);
    if (videoFile?.videoUrl) {
      URL.revokeObjectURL(videoFile.videoUrl);
    }
    if (videoRefs.current[id]) {
      delete videoRefs.current[id];
    }
    if (currentlyPlaying === id) {
      setCurrentlyPlaying(null);
    }

    setVideoFiles((prev) => prev.filter((vf) => vf.id !== id));
  };

  const togglePlayPause = (id: string) => {
    const videoFile = videoFiles.find((vf) => vf.id === id);
    if (!videoFile?.videoUrl) return;

    if (currentlyPlaying === id) {
      // Pause current
      const video = videoRefs.current[id];
      if (video) {
        video.pause();
      }
      setCurrentlyPlaying(null);
    } else {
      // Stop any currently playing video
      if (currentlyPlaying) {
        const currentVideo = videoRefs.current[currentlyPlaying];
        if (currentVideo) {
          currentVideo.pause();
          currentVideo.currentTime = 0;
        }
      }

      // Play new video
      if (!videoRefs.current[id]) {
        const video = document.createElement("video");
        video.src = videoFile.videoUrl;
        video.muted = true; // Mute for autoplay policies
        video.addEventListener("ended", () => setCurrentlyPlaying(null));
        videoRefs.current[id] = video;
      }

      videoRefs.current[id].play();
      setCurrentlyPlaying(id);
    }
  };

  const uploadVideo = async (videoFile: VideoFile) => {
    updateVideoFile(videoFile.id, { status: "uploading" });

    try {
      const formData = new FormData();
      formData.append("file", videoFile.file);
      formData.append("title", videoFile.title);
      formData.append("artist", videoFile.artist);
      formData.append("description", videoFile.description);
      formData.append("genre", videoFile.genre);
      formData.append("language", videoFile.language);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          updateVideoFile(videoFile.id, { progress });
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          updateVideoFile(videoFile.id, {
            status: "completed",
            progress: 100,
            cloudinaryUrl: result.url,
            cloudinaryId: result.public_id,
            thumbnailUrl: result.thumbnail_url,
          });
          onUploadComplete(result);
        } else {
          const error = xhr.responseText || "Upload failed";
          updateVideoFile(videoFile.id, {
            status: "error",
            error,
          });
          onUploadError(error);
        }
      });

      xhr.addEventListener("error", () => {
        updateVideoFile(videoFile.id, {
          status: "error",
          error: "Network error during upload",
        });
        onUploadError("Network error during upload");
      });

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    } catch (error) {
      updateVideoFile(videoFile.id, {
        status: "error",
        error: "Failed to start upload",
      });
      onUploadError("Failed to start upload");
    }
  };

  const uploadAll = () => {
    videoFiles
      .filter((vf) => vf.status === "pending")
      .forEach((videoFile) => {
        if (!videoFile.title.trim()) {
          updateVideoFile(videoFile.id, {
            status: "error",
            error: "Title is required",
          });
          return;
        }
        uploadVideo(videoFile);
      });
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
            : "border-gray-300 dark:border-gray-600"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <Video className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Upload Video Files
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Drag and drop your video files here, or click to browse
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Upload className="w-5 h-5" />
            Select Video Files
          </button>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Supported formats: MP4, AVI, MOV, MKV • Max size: 500MB per file
          </p>
        </div>
      </div>

      {/* Video Files List */}
      {videoFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Video Files ({videoFiles.length})
            </h3>
            <button
              onClick={uploadAll}
              disabled={videoFiles.every((vf) => vf.status !== "pending")}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload All
            </button>
          </div>

          <div className="space-y-4">
            {videoFiles.map((videoFile) => (
              <div
                key={videoFile.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start gap-4">
                  {/* Video Preview */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-32 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        {videoFile.videoUrl ? (
                          <video
                            src={videoFile.videoUrl}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileVideo className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                          </div>
                        )}
                      </div>
                      {videoFile.videoUrl && (
                        <button
                          onClick={() => togglePlayPause(videoFile.id)}
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          {currentlyPlaying === videoFile.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    {/* File Info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {videoFile.file.name}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{formatFileSize(videoFile.file.size)}</span>
                          {videoFile.duration && (
                            <span>{formatDuration(videoFile.duration)}</span>
                          )}
                          <span>{videoFile.file.type}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeVideoFile(videoFile.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Metadata Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label
                          htmlFor={`title-${videoFile.id}`}
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Title *
                        </label>
                        <input
                          id={`title-${videoFile.id}`}
                          type="text"
                          value={videoFile.title}
                          onChange={(e) =>
                            updateVideoFile(videoFile.id, {
                              title: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Enter title..."
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`artist-${videoFile.id}`}
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Artist
                        </label>
                        <input
                          id={`artist-${videoFile.id}`}
                          type="text"
                          value={videoFile.artist}
                          onChange={(e) =>
                            updateVideoFile(videoFile.id, {
                              artist: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Enter artist..."
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`genre-${videoFile.id}`}
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Genre
                        </label>
                        <select
                          id={`genre-${videoFile.id}`}
                          value={videoFile.genre}
                          onChange={(e) =>
                            updateVideoFile(videoFile.id, {
                              genre: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="POP">Pop</option>
                          <option value="ROCK">Rock</option>
                          <option value="HIPHOP">Hip Hop</option>
                          <option value="ELECTRONIC">Electronic</option>
                          <option value="BALLAD">Ballad</option>
                          <option value="R&B">R&B</option>
                          <option value="INDIE">Indie</option>
                          <option value="FOLK">Folk</option>
                          <option value="JAZZ">Jazz</option>
                          <option value="CLASSICAL">Classical</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor={`language-${videoFile.id}`}
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Language
                        </label>
                        <select
                          id={`language-${videoFile.id}`}
                          value={videoFile.language}
                          onChange={(e) =>
                            updateVideoFile(videoFile.id, {
                              language: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="KO">Korean</option>
                          <option value="EN">English</option>
                          <option value="JP">Japanese</option>
                          <option value="CN">Chinese</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor={`age-rating-${videoFile.id}`}
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Age Rating
                        </label>
                        <select
                          id={`age-rating-${videoFile.id}`}
                          value={videoFile.ageRating}
                          onChange={(e) =>
                            updateVideoFile(videoFile.id, {
                              ageRating: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="">Select Age Rating</option>
                          <option value="전체 관람가">
                            전체 관람가 (All Ages)
                          </option>
                          <option value="12세 이상">12세 이상 (12+)</option>
                          <option value="15세 이상">15세 이상 (15+)</option>
                          <option value="19세 이상">19세 이상 (19+)</option>
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label
                        htmlFor={`description-${videoFile.id}`}
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Description
                      </label>
                      <textarea
                        id={`description-${videoFile.id}`}
                        value={videoFile.description}
                        onChange={(e) =>
                          updateVideoFile(videoFile.id, {
                            description: e.target.value,
                          })
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Enter description..."
                      />
                    </div>

                    {/* Status and Progress */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {videoFile.status === "pending" && (
                          <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            Ready to upload
                          </span>
                        )}

                        {videoFile.status === "uploading" && (
                          <div className="flex items-center gap-3">
                            <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${videoFile.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                              {videoFile.progress}%
                            </span>
                          </div>
                        )}

                        {videoFile.status === "completed" && (
                          <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <Check className="w-4 h-4" />
                            Upload completed
                          </span>
                        )}

                        {videoFile.status === "error" && (
                          <span className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            {videoFile.error || "Upload failed"}
                          </span>
                        )}
                      </div>

                      {videoFile.status === "pending" && (
                        <button
                          onClick={() => uploadVideo(videoFile)}
                          disabled={!videoFile.title.trim()}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Upload
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
