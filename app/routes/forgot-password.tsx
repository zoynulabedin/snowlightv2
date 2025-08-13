import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("email", email);

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to send reset email");
      }
    } catch (error) {
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bugs-pink via-purple-500 to-blue-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-white rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              이메일이 전송되었습니다
            </h2>
            <p className="text-purple-100">
              비밀번호 재설정 링크를 이메일로 보내드렸습니다
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center space-y-4">
              <div className="text-green-600 mb-4">
                <CheckCircle className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                이메일을 확인해주세요
              </h3>
              <p className="text-gray-600">
                <strong>{email}</strong>로 비밀번호 재설정 링크를
                보내드렸습니다.
              </p>
              <p className="text-sm text-gray-500">
                이메일이 도착하지 않았다면 스팸 폴더를 확인해주세요.
              </p>

              <div className="pt-6 space-y-3">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 px-4 bg-gradient-to-r from-bugs-pink to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
                >
                  로그인 페이지로 돌아가기
                </button>
                <button
                  onClick={() => setSuccess(false)}
                  className="w-full py-3 px-4 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  다른 이메일로 다시 시도
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bugs-pink via-purple-500 to-blue-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-white rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-bugs-pink">B</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            비밀번호 재설정
          </h2>
          <p className="text-purple-100">
            이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              로그인으로 돌아가기
            </button>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                이메일 주소
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bugs-pink focus:border-transparent"
                  placeholder="이메일을 입력하세요"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-bugs-pink to-purple-600 hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bugs-pink disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>전송 중...</span>
                </div>
              ) : (
                "비밀번호 재설정 링크 전송"
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              계정이 기억나셨나요?{" "}
              <button
                onClick={() => navigate("/login")}
                className="font-medium text-bugs-pink hover:text-pink-600 transition-colors"
              >
                로그인하기
              </button>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            도움이 필요하신가요?
          </h3>
          <p className="text-purple-100 text-sm mb-4">
            계정 관련 문제가 있으시면 고객센터로 문의해주세요
          </p>
          <a
            href="mailto:support@bugs.co.kr"
            className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
          >
            고객센터 문의
          </a>
        </div>
      </div>
    </div>
  );
}
