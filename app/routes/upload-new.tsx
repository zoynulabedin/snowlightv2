import { useState } from "react";
import { Music, Video } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import Layout from "~/components/Layout";
import AudioUploader from "~/components/AudioUploader";
import VideoUploader from "~/components/VideoUploader";

interface UploadResult {
  url: string;
  public_id: string;
  duration?: number;
  [key: string]: unknown;
}

export default function UploadPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"audio" | "video">("audio");
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const handleUploadComplete = (result: UploadResult) => {
    setUploadResults((prev) => [...prev, result]);
    // Auto-clear success message after 5 seconds
    setTimeout(() => {
      setUploadResults((prev) => prev.filter((r) => r !== result));
    }, 5000);
  };

  const handleUploadError = (error: string) => {
    setUploadErrors((prev) => [...prev, error]);
    // Auto-clear error message after 10 seconds
    setTimeout(() => {
      setUploadErrors((prev) => prev.filter((e) => e !== error));
    }, 10000);
  };

  const clearMessages = () => {
    setUploadResults([]);
    setUploadErrors([]);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Upload Your Content
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Share your music and videos with the world. Upload high-quality
              audio and video content with detailed metadata to reach your
              audience.
            </p>
          </div>

          {/* Success/Error Messages */}
          {(uploadResults.length > 0 || uploadErrors.length > 0) && (
            <div className="mb-6 space-y-3">
              {uploadResults.map((result, index) => (
                <div
                  key={index}
                  className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 px-4 py-3 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <span>✅ Upload completed successfully!</span>
                    <button
                      onClick={clearMessages}
                      className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {uploadErrors.map((error, index) => (
                <div
                  key={index}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-4 py-3 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <span>❌ {error}</span>
                    <button
                      onClick={clearMessages}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Type Tabs */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("audio")}
                  className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 font-medium rounded-l-lg transition-colors ${
                    activeTab === "audio"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <Music className="w-5 h-5" />
                  Audio Upload
                </button>

                <button
                  onClick={() => setActiveTab("video")}
                  className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 font-medium rounded-r-lg transition-colors ${
                    activeTab === "video"
                      ? "bg-red-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <Video className="w-5 h-5" />
                  Video Upload
                </button>
              </div>
            </div>
          </div>

          {/* Upload Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            {activeTab === "audio" && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Music className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Audio Upload
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Upload music tracks with metadata and artist information
                    </p>
                  </div>
                </div>

                <AudioUploader
                  onUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                />
              </div>
            )}

            {activeTab === "video" && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <Video className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Video Upload
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Upload music videos and visual content with detailed
                      information
                    </p>
                  </div>
                </div>

                <VideoUploader
                  onUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                />
              </div>
            )}
          </div>

          {/* Upload Guidelines */}
          <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Upload Guidelines
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Audio Files
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Supported formats: MP3, WAV, FLAC, AAC</li>
                  <li>• Maximum file size: 100MB</li>
                  <li>• Recommended quality: 320kbps or higher</li>
                  <li>• Include title, artist, and genre information</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Video Files
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Supported formats: MP4, AVI, MOV, MKV</li>
                  <li>• Maximum file size: 500MB</li>
                  <li>• Recommended resolution: 1080p or higher</li>
                  <li>• Include title, description, and age rating</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-400">
                <strong>Note:</strong> All uploads are subject to review and
                approval. Please ensure your content follows our community
                guidelines and copyright policies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
