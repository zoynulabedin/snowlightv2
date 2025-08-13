import { useState, useEffect, useCallback } from "react";
import {
  Heart,
  Plus,
  Gift,
  Calendar,
  Upload,
  Share2,
  TrendingUp,
  CreditCard,
  RotateCcw,
} from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import { useAuth } from "~/contexts/AuthContext";
import PaymentModal from "./PaymentModal";

interface HeartTransaction {
  id: string;
  type: string;
  amount: number;
  reason: string | null;
  createdAt: string;
}

interface PaymentTransaction {
  id: string;
  type: string;
  amount: number;
  reason: string | null;
  createdAt: string;
}

interface HeartPackage {
  id: string;
  hearts: number;
  price: number;
  bonus: number;
  popular?: boolean;
}

export default function HeartManager() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [currentHearts, setCurrentHearts] = useState(0);
  const [history, setHistory] = useState<HeartTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackageForPayment, setSelectedPackageForPayment] =
    useState<HeartPackage | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>(
    []
  );
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);

  const heartPackages: HeartPackage[] = [
    {
      id: "small",
      hearts: 100,
      price: 1000,
      bonus: 10,
    },
    {
      id: "medium",
      hearts: 500,
      price: 4500,
      bonus: 100,
      popular: true,
    },
    {
      id: "large",
      hearts: 1000,
      price: 8000,
      bonus: 300,
    },
    {
      id: "mega",
      hearts: 2500,
      price: 18000,
      bonus: 1000,
    },
  ];

  const fetchHeartData = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/hearts?userId=${user.id}`);
      const data = await response.json();

      if (data.error) {
        console.error("Error fetching hearts:", data.error);
        return;
      }

      setCurrentHearts(data.currentHearts);
      setHistory(data.history);
    } catch (error) {
      console.error("Error fetching heart data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchPaymentHistory = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/payment-history?userId=${user.id}`);
      const data = await response.json();

      if (data.error) {
        console.error("Error fetching payment history:", data.error);
        return;
      }

      setPaymentHistory(data.paymentHistory);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchHeartData();
      fetchPaymentHistory();
    }
  }, [user, fetchHeartData, fetchPaymentHistory]);

  const openPaymentModal = (packageId: string) => {
    const heartPackage = heartPackages.find((p) => p.id === packageId);
    if (heartPackage) {
      setSelectedPackageForPayment(heartPackage);
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = () => {
    fetchHeartData();
    fetchPaymentHistory();
    setShowPaymentModal(false);
    setSelectedPackageForPayment(null);
  };

  const requestRefund = async (paymentId: string) => {
    if (!user) return;

    if (
      !confirm(
        "정말로 환불을 요청하시겠습니까? 결제 후 7일 이내에만 전액 환불이 가능합니다."
      )
    ) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("action", "request_refund");
      formData.append("userId", user.id);
      formData.append("paymentId", paymentId);
      formData.append("reason", "사용자 요청");

      const response = await fetch("/api/payment-history", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        fetchHeartData();
        fetchPaymentHistory();
      } else {
        alert(data.error || "환불 요청 실패");
      }
    } catch (error) {
      console.error("Error requesting refund:", error);
      alert("환불 요청 중 오류가 발생했습니다.");
    }
  };

  const claimDailyBonus = async () => {
    if (!user) return;

    try {
      const formData = new FormData();
      formData.append("action", "add");
      formData.append("userId", user.id);
      formData.append("amount", "50");
      formData.append("type", "DAILY_LOGIN");
      formData.append("reason", "일일 로그인 보너스");

      const response = await fetch("/api/hearts", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setCurrentHearts(data.newHeartCount);
        fetchHeartData();
        alert(t("credits.hearts_added"));
      } else {
        alert(data.error || "Failed to claim bonus");
      }
    } catch (error) {
      console.error("Error claiming daily bonus:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "DAILY_LOGIN":
        return <Calendar className="w-4 h-4 text-green-500" />;
      case "UPLOAD":
        return <Upload className="w-4 h-4 text-blue-500" />;
      case "SHARE":
        return <Share2 className="w-4 h-4 text-purple-500" />;
      case "PURCHASE":
        return <Plus className="w-4 h-4 text-green-500" />;
      case "SPEND":
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      default:
        return <Heart className="w-4 h-4 text-pink-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bugs-pink mx-auto"></div>
          <p className="mt-2 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Hearts Display */}
      <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {t("credits.current_hearts")}
            </h2>
            <div className="flex items-center space-x-2 mt-2">
              <Heart className="w-8 h-8 fill-current" />
              <span className="text-3xl font-bold">
                {currentHearts.toLocaleString()}
              </span>
            </div>
          </div>
          <button
            onClick={claimDailyBonus}
            className="bg-white text-pink-500 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            <Gift className="w-4 h-4 inline mr-2" />
            {t("credits.daily_bonus")}
          </button>
        </div>
      </div>

      {/* Heart Packages */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {t("credits.heart_packages")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {heartPackages.map((pkg) => (
            <button
              key={pkg.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all text-left ${
                selectedPackage === pkg.id
                  ? "border-bugs-pink bg-pink-50"
                  : "border-gray-200 hover:border-bugs-pink"
              } ${pkg.popular ? "ring-2 ring-orange-400" : ""}`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              {pkg.popular && (
                <div className="bg-orange-400 text-white text-xs px-2 py-1 rounded-full inline-block mb-2">
                  {t("membership.popular")}
                </div>
              )}
              <div className="text-center">
                <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <div className="text-xl font-bold">
                  {pkg.hearts.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">
                  + {pkg.bonus} {t("credits.hearts")} 보너스
                </div>
                <div className="text-lg font-semibold mt-2">
                  ₩{pkg.price.toLocaleString()}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openPaymentModal(pkg.id);
                  }}
                  className="w-full mt-3 bg-bugs-pink text-white py-2 rounded-md hover:bg-pink-600 transition-colors"
                >
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  {t("credits.purchase_hearts")}
                </button>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Heart History */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {t("credits.heart_history")}
        </h3>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {history.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>아직 하트 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {history.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.reason || `${transaction.type} 거래`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`font-bold ${
                      transaction.amount > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* How to Earn Hearts */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4">
          {t("credits.earn_hearts")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-medium">일일 로그인</div>
              <div className="text-sm text-gray-600">매일 50 하트</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Upload className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-medium">음악 업로드</div>
              <div className="text-sm text-gray-600">업로드당 100 하트</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Share2 className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-medium">음악 공유</div>
              <div className="text-sm text-gray-600">공유당 20 하트</div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">결제 내역</h3>
          <button
            onClick={() => setShowPaymentHistory(!showPaymentHistory)}
            className="text-bugs-pink hover:text-pink-600 font-medium"
          >
            {showPaymentHistory ? "숨기기" : "보기"}
          </button>
        </div>

        {showPaymentHistory && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {paymentHistory.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>아직 결제 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {payment.reason || "하트 구매"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(payment.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        +{payment.amount.toLocaleString()} 하트
                      </div>
                      <button
                        onClick={() => requestRefund(payment.id)}
                        className="text-xs text-gray-500 hover:text-red-500 mt-1"
                      >
                        <RotateCcw className="w-3 h-3 inline mr-1" />
                        환불 요청
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedPackageForPayment(null);
        }}
        package={selectedPackageForPayment}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
