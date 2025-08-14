import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl) {
      setError("유효하지 않은 재설정 링크입니다.");
      return;
    }
    setToken(tokenFromUrl);
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("token", token);
      formDataToSend.append("password", formData.password);

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (error) {
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-Snowlight-pink via-purple-500 to-blue-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-white rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              비밀번호가 변경되었습니다
            </h2>
            <p className="text-purple-100">새로운 비밀번호로 로그인해주세요</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center space-y-4">
              <div className="text-green-600 mb-4">
                <CheckCircle className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                성공적으로 변경되었습니다!
              </h3>
              <p className="text-gray-600">
                비밀번호가 안전하게 변경되었습니다. 새로운 비밀번호로
                로그인해주세요.
              </p>

              <div className="pt-6">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 px-4 bg-gradient-to-r from-Snowlight-pink to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
                >
                  로그인하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-Snowlight-pink via-purple-500 to-blue-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              유효하지 않은 링크
            </h3>
            <p className="text-gray-600 mb-6">
              비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.
            </p>
            <button
              onClick={() => navigate("/forgot-password")}
              className="w-full py-3 px-4 bg-gradient-to-r from-Snowlight-pink to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
            >
              새로운 재설정 링크 요청
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-Snowlight-pink via-purple-500 to-blue-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-white rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-Snowlight-pink">B</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            새 비밀번호 설정
          </h2>
          <p className="text-purple-100">
            계정 보안을 위해 강력한 비밀번호를 설정해주세요
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                새 비밀번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-Snowlight-pink focus:border-transparent"
                  placeholder="새 비밀번호를 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                비밀번호 확인
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-Snowlight-pink focus:border-transparent"
                  placeholder="비밀번호를 다시 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                비밀번호 요구사항:
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      formData.password.length >= 6
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  최소 6자 이상
                </li>
                <li className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      /[A-Za-z]/.test(formData.password) &&
                      /[0-9]/.test(formData.password)
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  영문자와 숫자 포함 (권장)
                </li>
                <li className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      formData.password === formData.confirmPassword &&
                      formData.password.length > 0
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  비밀번호 확인 일치
                </li>
              </ul>
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
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-Snowlight-pink to-purple-600 hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-Snowlight-pink disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>변경 중...</span>
                </div>
              ) : (
                "비밀번호 변경하기"
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              문제가 있나요?{" "}
              <button
                onClick={() => navigate("/forgot-password")}
                className="font-medium text-Snowlight-pink hover:text-pink-600 transition-colors"
              >
                새로운 재설정 링크 요청
              </button>
            </p>
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            🔒 보안 안내
          </h3>
          <p className="text-purple-100 text-sm">
            비밀번호가 변경되면 모든 기기에서 로그아웃됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
