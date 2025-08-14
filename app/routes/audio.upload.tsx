import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import {
  Upload,
  Music,
  Video,
  FileAudio,
  FileVideo,
  X,
  Check,
  AlertCircle,
  Play,
  Pause,
} from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import MediaPreview from "~/components/MediaPreview";
import Layout from "~/components/Layout";

interface UploadFile {
  id: string;
  file: File;
  type: "audio" | "video";
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  description?: string;
  cloudinaryUrl?: string;
  cloudinaryId?: string;
  error?: string;
}

export default function UploadPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

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
    const validFiles = files.filter((file) => {
      const isAudio = file.type.startsWith("audio/");
      const isVideo = file.type.startsWith("video/");
      return isAudio || isVideo;
    });

    const newUploadFiles: UploadFile[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      type: file.type.startsWith("audio/") ? "audio" : "video",
      progress: 0,
      status: "pending",
    }));

    setUploadFiles((prev) => [...prev, ...newUploadFiles]);
  };

  const removeFile = (id: string) => {
    setUploadFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const updateFileMetadata = (id: string, metadata: Partial<UploadFile>) => {
    setUploadFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, ...metadata } : file))
    );
  };

  const uploadToCloudinary = async (uploadFile: UploadFile) => {
    const formData = new FormData();
    formData.append("file", uploadFile.file);
    formData.append("title", uploadFile.title || "");
    formData.append("artist", uploadFile.artist || "");
    formData.append("album", uploadFile.album || "");
    formData.append("genre", uploadFile.genre || "");
    formData.append("description", uploadFile.description || "");

    try {
      setUploadFiles((prev) =>
        prev.map((file) =>
          file.id === uploadFile.id
            ? { ...file, status: "uploading", progress: 0 }
            : file
        )
      );

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadFiles((prev) =>
          prev.map((file) => {
            if (file.id === uploadFile.id && file.status === "uploading") {
              const newProgress = Math.min(
                file.progress + Math.random() * 20,
                90
              );
              return { ...file, progress: newProgress };
            }
            return file;
          })
        );
      }, 500);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      const result = await response.json();

      if (response.ok && result.success) {
        setUploadFiles((prev) =>
          prev.map((file) =>
            file.id === uploadFile.id
              ? {
                  ...file,
                  status: "completed",
                  progress: 100,
                  cloudinaryUrl: result.file.url,
                  cloudinaryId: result.file.id,
                }
              : file
          )
        );

        // Redirect to dashboard after 2 seconds for audio files
        if (uploadFile.type === "audio") {
          setTimeout(() => {
            navigate("/dashboard/audio");
          }, 2000);
        }
      } else {
        setUploadFiles((prev) =>
          prev.map((file) =>
            file.id === uploadFile.id
              ? {
                  ...file,
                  status: "error",
                  error: result.error || "Upload failed",
                }
              : file
          )
        );
      }
    } catch (error) {
      setUploadFiles((prev) =>
        prev.map((file) =>
          file.id === uploadFile.id
            ? {
                ...file,
                status: "error",
                error: "Network error occurred",
              }
            : file
        )
      );
    }
  };

  const uploadAll = () => {
    uploadFiles.forEach((file) => {
      if (file.status === "pending") {
        uploadToCloudinary(file);
      }
    });
  };

  const generateThumbnail = (
    title: string,
    artist: string,
    type: "audio" | "video"
  ) => {
    const colors = [
      "from-pink-500 to-purple-600",
      "from-blue-500 to-cyan-600",
      "from-green-500 to-teal-600",
      "from-orange-500 to-red-600",
      "from-purple-500 to-indigo-600",
      "from-yellow-500 to-orange-600",
    ];

    const colorIndex = (title.length + artist.length) % colors.length;
    const gradient = colors[colorIndex];

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${
              gradient.includes("pink")
                ? "#ec4899"
                : gradient.includes("blue")
                ? "#3b82f6"
                : gradient.includes("green")
                ? "#10b981"
                : gradient.includes("orange")
                ? "#f97316"
                : gradient.includes("purple")
                ? "#8b5cf6"
                : "#eab308"
            };stop-opacity:1" />
            <stop offset="100%" style="stop-color:${
              gradient.includes("purple")
                ? "#9333ea"
                : gradient.includes("cyan")
                ? "#06b6d4"
                : gradient.includes("teal")
                ? "#14b8a6"
                : gradient.includes("red")
                ? "#dc2626"
                : gradient.includes("indigo")
                ? "#6366f1"
                : "#f97316"
            };stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="url(#grad)" />
        <circle cx="100" cy="80" r="25" fill="white" opacity="0.9"/>
        <polygon points="92,70 92,90 110,80" fill="${
          gradient.includes("pink")
            ? "#ec4899"
            : gradient.includes("blue")
            ? "#3b82f6"
            : gradient.includes("green")
            ? "#10b981"
            : gradient.includes("orange")
            ? "#f97316"
            : gradient.includes("purple")
            ? "#8b5cf6"
            : "#eab308"
        }"/>
        <text x="100" y="130" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="white">${
          title.length > 12 ? title.substring(0, 12) + "..." : title
        }</text>
        <text x="100" y="150" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="white" opacity="0.9">${
          artist.length > 15 ? artist.substring(0, 15) + "..." : artist
        }</text>
        ${
          type === "audio"
            ? `
          <path d="M85 170 Q100 160 115 170 Q100 180 85 170" fill="white" opacity="0.7"/>
          <path d="M85 175 Q100 165 115 175 Q100 185 85 175" fill="white" opacity="0.5"/>
          <path d="M85 180 Q100 170 115 180 Q100 190 85 180" fill="white" opacity="0.3"/>
        `
            : `
          <rect x="85" y="165" width="30" height="20" rx="2" fill="white" opacity="0.8"/>
          <circle cx="100" cy="175" r="4" fill="${
            gradient.includes("pink") ? "#ec4899" : "#3b82f6"
          }"/>
        `
        }
      </svg>
    `)}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("upload.title", "음악 및 비디오 업로드")}
            </h1>
            <p className="text-gray-600">
              {t(
                "upload.description",
                "오디오 파일과 비디오 파일을 업로드하여 벅스에서 공유하세요"
              )}
            </p>
          </div>

          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-Snowlight-pink bg-pink-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept="audio/*,video/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t(
                    "upload.dropFiles",
                    "파일을 여기에 드래그하거나 클릭하여 선택하세요"
                  )}
                </h3>
                <p className="text-sm text-gray-600">
                  {t(
                    "upload.supportedFormats",
                    "지원 형식: MP3, WAV, FLAC, AAC, MP4, AVI, MOV, WMV"
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t(
                    "upload.maxSize",
                    "최대 파일 크기: 오디오 100MB, 비디오 500MB"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Upload Queue */}
          {uploadFiles.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t("upload.queue", "업로드 대기열")} ({uploadFiles.length})
                </h2>
                <button
                  onClick={uploadAll}
                  disabled={uploadFiles.every((f) => f.status !== "pending")}
                  className="px-4 py-2 bg-Snowlight-pink text-white rounded-md hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {t("upload.uploadAll", "모두 업로드")}
                </button>
              </div>

              <div className="space-y-4">
                {uploadFiles.map((uploadFile) => (
                  <div
                    key={uploadFile.id}
                    className="bg-white rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Thumbnail Preview */}
                      <div className="flex-shrink-0">
                        {uploadFile.title && uploadFile.artist ? (
                          <img
                            src={generateThumbnail(
                              uploadFile.title,
                              uploadFile.artist,
                              uploadFile.type
                            )}
                            alt={`${uploadFile.title} thumbnail`}
                            className="w-16 h-16 rounded-lg object-cover shadow-sm"
                          />
                        ) : uploadFile.type === "audio" ? (
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <FileAudio className="w-8 h-8 text-white" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                            <FileVideo className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {uploadFile.file.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {uploadFile.status === "completed" && (
                              <Check className="w-4 h-4 text-green-500" />
                            )}
                            {uploadFile.status === "error" && (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                            <button
                              onClick={() => removeFile(uploadFile.id)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                          <span>{formatFileSize(uploadFile.file.size)}</span>
                          <span className="capitalize">{uploadFile.type}</span>
                          <span>{uploadFile.file.type}</span>
                        </div>

                        {/* Progress Bar */}
                        {uploadFile.status === "uploading" && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>업로드 중...</span>
                              <span>{Math.round(uploadFile.progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-Snowlight-pink h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${uploadFile.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Error Message */}
                        {uploadFile.status === "error" && (
                          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">
                              {uploadFile.error}
                            </p>
                          </div>
                        )}

                        {/* Metadata Form */}
                        {uploadFile.status === "pending" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            <input
                              type="text"
                              placeholder={t("upload.title", "제목")}
                              value={uploadFile.title || ""}
                              onChange={(e) =>
                                updateFileMetadata(uploadFile.id, {
                                  title: e.target.value,
                                })
                              }
                              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-Snowlight-pink focus:border-transparent"
                            />
                            <input
                              type="text"
                              placeholder={t("upload.artist", "아티스트")}
                              value={uploadFile.artist || ""}
                              onChange={(e) =>
                                updateFileMetadata(uploadFile.id, {
                                  artist: e.target.value,
                                })
                              }
                              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-Snowlight-pink focus:border-transparent"
                            />
                            {uploadFile.type === "audio" && (
                              <>
                                <input
                                  type="text"
                                  placeholder={t("upload.album", "앨범")}
                                  value={uploadFile.album || ""}
                                  onChange={(e) =>
                                    updateFileMetadata(uploadFile.id, {
                                      album: e.target.value,
                                    })
                                  }
                                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-Snowlight-pink focus:border-transparent"
                                />
                                <select
                                  value={uploadFile.genre || ""}
                                  onChange={(e) =>
                                    updateFileMetadata(uploadFile.id, {
                                      genre: e.target.value,
                                    })
                                  }
                                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-Snowlight-pink focus:border-transparent"
                                >
                                  <option value="">
                                    {t("upload.selectGenre", "장르 선택")}
                                  </option>
                                  <option value="kpop">K-POP</option>
                                  <option value="pop">POP</option>
                                  <option value="rock">ROCK</option>
                                  <option value="hiphop">HIP-HOP</option>
                                  <option value="rnb">R&B</option>
                                  <option value="jazz">JAZZ</option>
                                  <option value="classical">CLASSICAL</option>
                                  <option value="electronic">ELECTRONIC</option>
                                  <option value="indie">INDIE</option>
                                  <option value="folk">FOLK</option>
                                </select>
                              </>
                            )}
                            <textarea
                              placeholder={t("upload.description", "설명")}
                              value={uploadFile.description || ""}
                              onChange={(e) =>
                                updateFileMetadata(uploadFile.id, {
                                  description: e.target.value,
                                })
                              }
                              rows={2}
                              className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-Snowlight-pink focus:border-transparent resize-none"
                            />
                          </div>
                        )}

                        {/* Upload Button */}
                        {uploadFile.status === "pending" && (
                          <div className="mt-3">
                            <button
                              onClick={() => uploadToCloudinary(uploadFile)}
                              className="px-4 py-2 bg-Snowlight-pink text-white text-sm rounded-md hover:bg-pink-600 transition-colors"
                            >
                              {t("upload.upload", "업로드")}
                            </button>
                          </div>
                        )}

                        {/* Success Message with Preview */}
                        {uploadFile.status === "completed" && (
                          <div className="mt-3">
                            <div className="p-3 bg-green-50 border border-green-200 rounded-md mb-3">
                              <div className="flex items-center">
                                <Check className="w-4 h-4 text-green-500 mr-2" />
                                <span className="text-sm text-green-700">
                                  {uploadFile.type === "audio"
                                    ? "Upload completed! Redirecting to audio dashboard..."
                                    : "Upload completed successfully!"}
                                </span>
                              </div>
                              {uploadFile.cloudinaryUrl && (
                                <div className="mt-2">
                                  <p className="text-xs text-green-600">
                                    URL:{" "}
                                    <a
                                      href={uploadFile.cloudinaryUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="underline"
                                    >
                                      {uploadFile.cloudinaryUrl}
                                    </a>
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Enhanced Media Preview */}
                            {uploadFile.cloudinaryUrl && (
                              <MediaPreview
                                url={uploadFile.cloudinaryUrl}
                                type={uploadFile.type}
                                title={uploadFile.title || uploadFile.file.name}
                                artist={uploadFile.artist}
                                className="mt-3"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Guidelines */}
          <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("upload.guidelines", "업로드 가이드라인")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Music className="w-4 h-4 mr-2 text-blue-500" />
                  {t("upload.audioGuidelines", "오디오 파일")}
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 지원 형식: MP3, WAV, FLAC, AAC, OGG</li>
                  <li>• 최대 파일 크기: 100MB</li>
                  <li>• 권장 품질: 320kbps 이상</li>
                  <li>• 최소 길이: 30초</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Video className="w-4 h-4 mr-2 text-purple-500" />
                  {t("upload.videoGuidelines", "비디오 파일")}
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 지원 형식: MP4, AVI, MOV, WMV, MKV</li>
                  <li>• 최대 파일 크기: 500MB</li>
                  <li>• 권장 해상도: 1080p 이상</li>
                  <li>• 최소 길이: 30초</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">
                    {t("upload.copyright", "저작권 안내")}
                  </p>
                  <p>
                    {t(
                      "upload.copyrightNotice",
                      "업로드하는 모든 콘텐츠는 저작권을 소유하고 있거나 적절한 라이선스를 보유한 것이어야 합니다. 저작권을 침해하는 콘텐츠는 삭제될 수 있습니다."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
