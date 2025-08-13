import { useState, useRef } from "react";
import {
  Upload,
  Music,
  FileAudio,
  X,
  Check,
  AlertCircle,
  Play,
  Pause,
  Volume2,
} from "lucide-react";

interface AudioUploaderProps {
  onUploadComplete: (result: any) => void;
  onUploadError: (error: string) => void;
}

interface AudioFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  title: string;
  artist: string;
  album: string;
  genre: string;
  description: string;
  cloudinaryUrl?: string;
  cloudinaryId?: string;
  error?: string;
  audioUrl?: string;
  duration?: number;
}

export default function AudioUploader({
  onUploadComplete,
  onUploadError,
}: AudioUploaderProps) {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

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
    const audioFiles = files.filter((file) => file.type.startsWith("audio/"));

    if (audioFiles.length === 0) {
      onUploadError("Please select audio files only");
      return;
    }

    const newAudioFiles: AudioFile[] = audioFiles.map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: "pending",
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: "",
      album: "",
      genre: "POP",
      description: "",
    }));

    setAudioFiles((prev) => [...prev, ...newAudioFiles]);

    // Create audio URLs for preview
    newAudioFiles.forEach((audioFile) => {
      const url = URL.createObjectURL(audioFile.file);
      setAudioFiles((prev) =>
        prev.map((af) =>
          af.id === audioFile.id ? { ...af, audioUrl: url } : af
        )
      );

      // Create audio element for duration detection
      const audio = new Audio(url);
      audio.addEventListener("loadedmetadata", () => {
        setAudioFiles((prev) =>
          prev.map((af) =>
            af.id === audioFile.id
              ? { ...af, duration: Math.round(audio.duration) }
              : af
          )
        );
      });
    });
  };

  const updateAudioFile = (id: string, updates: Partial<AudioFile>) => {
    setAudioFiles((prev) =>
      prev.map((af) => (af.id === id ? { ...af, ...updates } : af))
    );
  };

  const removeAudioFile = (id: string) => {
    // Clean up audio URL and ref
    const audioFile = audioFiles.find((af) => af.id === id);
    if (audioFile?.audioUrl) {
      URL.revokeObjectURL(audioFile.audioUrl);
    }
    if (audioRefs.current[id]) {
      delete audioRefs.current[id];
    }
    if (currentlyPlaying === id) {
      setCurrentlyPlaying(null);
    }

    setAudioFiles((prev) => prev.filter((af) => af.id !== id));
  };

  const togglePlayPause = (id: string) => {
    const audioFile = audioFiles.find((af) => af.id === id);
    if (!audioFile?.audioUrl) return;

    if (currentlyPlaying === id) {
      // Pause current
      const audio = audioRefs.current[id];
      if (audio) {
        audio.pause();
      }
      setCurrentlyPlaying(null);
    } else {
      // Stop any currently playing audio
      if (currentlyPlaying) {
        const currentAudio = audioRefs.current[currentlyPlaying];
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
      }

      // Play new audio
      if (!audioRefs.current[id]) {
        const audio = new Audio(audioFile.audioUrl);
        audio.addEventListener("ended", () => setCurrentlyPlaying(null));
        audioRefs.current[id] = audio;
      }

      audioRefs.current[id].play();
      setCurrentlyPlaying(id);
    }
  };

  const uploadAudio = async (audioFile: AudioFile) => {
    updateAudioFile(audioFile.id, { status: "uploading" });

    try {
      const formData = new FormData();
      formData.append("file", audioFile.file);
      formData.append("title", audioFile.title);
      formData.append("artist", audioFile.artist);
      formData.append("album", audioFile.album);
      formData.append("genre", audioFile.genre);
      formData.append("description", audioFile.description);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          updateAudioFile(audioFile.id, { progress });
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          updateAudioFile(audioFile.id, {
            status: "completed",
            progress: 100,
            cloudinaryUrl: result.url,
            cloudinaryId: result.public_id,
          });
          onUploadComplete(result);
        } else {
          const error = xhr.responseText || "Upload failed";
          updateAudioFile(audioFile.id, {
            status: "error",
            error,
          });
          onUploadError(error);
        }
      });

      xhr.addEventListener("error", () => {
        updateAudioFile(audioFile.id, {
          status: "error",
          error: "Network error during upload",
        });
        onUploadError("Network error during upload");
      });

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    } catch (error) {
      updateAudioFile(audioFile.id, {
        status: "error",
        error: "Failed to start upload",
      });
      onUploadError("Failed to start upload");
    }
  };

  const uploadAll = () => {
    audioFiles
      .filter((af) => af.status === "pending")
      .forEach((audioFile) => {
        if (!audioFile.title.trim()) {
          updateAudioFile(audioFile.id, {
            status: "error",
            error: "Title is required",
          });
          return;
        }
        uploadAudio(audioFile);
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
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
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
          accept="audio/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Music className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Upload Audio Files
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Drag and drop your audio files here, or click to browse
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Upload className="w-5 h-5" />
            Select Audio Files
          </button>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Supported formats: MP3, WAV, FLAC, AAC • Max size: 100MB per file
          </p>
        </div>
      </div>

      {/* Audio Files List */}
      {audioFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Audio Files ({audioFiles.length})
            </h3>
            <button
              onClick={uploadAll}
              disabled={audioFiles.every((af) => af.status !== "pending")}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload All
            </button>
          </div>

          <div className="space-y-4">
            {audioFiles.map((audioFile) => (
              <div
                key={audioFile.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start gap-4">
                  {/* Audio Icon and Play Button */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <FileAudio className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                      </div>
                      {audioFile.audioUrl && (
                        <button
                          onClick={() => togglePlayPause(audioFile.id)}
                          className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          {currentlyPlaying === audioFile.id ? (
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
                          {audioFile.file.name}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{formatFileSize(audioFile.file.size)}</span>
                          {audioFile.duration && (
                            <span>{formatDuration(audioFile.duration)}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Volume2 className="w-4 h-4" />
                            {audioFile.file.type}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeAudioFile(audioFile.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Metadata Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={audioFile.title}
                          onChange={(e) =>
                            updateAudioFile(audioFile.id, {
                              title: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter title..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Artist
                        </label>
                        <input
                          type="text"
                          value={audioFile.artist}
                          onChange={(e) =>
                            updateAudioFile(audioFile.id, {
                              artist: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter artist..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Album
                        </label>
                        <input
                          type="text"
                          value={audioFile.album}
                          onChange={(e) =>
                            updateAudioFile(audioFile.id, {
                              album: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter album..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Genre
                        </label>
                        <select
                          value={audioFile.genre}
                          onChange={(e) =>
                            updateAudioFile(audioFile.id, {
                              genre: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={audioFile.description}
                        onChange={(e) =>
                          updateAudioFile(audioFile.id, {
                            description: e.target.value,
                          })
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter description..."
                      />
                    </div>

                    {/* Status and Progress */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {audioFile.status === "pending" && (
                          <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            Ready to upload
                          </span>
                        )}

                        {audioFile.status === "uploading" && (
                          <div className="flex items-center gap-3">
                            <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${audioFile.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                              {audioFile.progress}%
                            </span>
                          </div>
                        )}

                        {audioFile.status === "completed" && (
                          <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <Check className="w-4 h-4" />
                            Upload completed
                          </span>
                        )}

                        {audioFile.status === "error" && (
                          <span className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            {audioFile.error || "Upload failed"}
                          </span>
                        )}
                      </div>

                      {audioFile.status === "pending" && (
                        <button
                          onClick={() => uploadAudio(audioFile)}
                          disabled={!audioFile.title.trim()}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
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
