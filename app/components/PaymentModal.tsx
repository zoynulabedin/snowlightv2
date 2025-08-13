import { useState } from "react";
import {
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  Lock,
  CheckCircle,
  X,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import { useAuth } from "~/contexts/AuthContext";

interface PaymentMethod {
  id: string;
  name: string;
  nameEn: string;
  icon: React.ReactNode;
  description: string;
  descriptionEn: string;
  fee?: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: {
    id: string;
    hearts: number;
    price: number;
    bonus: number;
  } | null;
  onPaymentSuccess: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  package: heartPackage,
  onPaymentSuccess,
}: PaymentModalProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [paymentStep, setPaymentStep] = useState<
    "method" | "details" | "processing" | "success" | "error"
  >("method");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const paymentMethods: PaymentMethod[] = [
    {
      id: "credit_card",
      name: "신용카드",
      nameEn: "Credit Card",
      icon: <CreditCard className="w-6 h-6" />,
      description: "Visa, MasterCard, AMEX",
      descriptionEn: "Visa, MasterCard, AMEX",
      fee: 0,
    },
    {
      id: "phone_payment",
      name: "휴대폰 결제",
      nameEn: "Mobile Payment",
      icon: <Smartphone className="w-6 h-6" />,
      description: "통신사 결제",
      descriptionEn: "Carrier billing",
      fee: 110,
    },
    {
      id: "bank_transfer",
      name: "계좌이체",
      nameEn: "Bank Transfer",
      icon: <Building2 className="w-6 h-6" />,
      description: "실시간 계좌이체",
      descriptionEn: "Real-time bank transfer",
      fee: 0,
    },
    {
      id: "kakaopay",
      name: "카카오페이",
      nameEn: "KakaoPay",
      icon: <Wallet className="w-6 h-6" />,
      description: "간편결제",
      descriptionEn: "Simple payment",
      fee: 0,
    },
  ];

  if (!isOpen || !heartPackage) return null;

  const totalPrice =
    heartPackage.price +
    (paymentMethods.find((m) => m.id === selectedPaymentMethod)?.fee || 0);

  const handlePaymentSubmit = async () => {
    if (!selectedPaymentMethod || !user) return;

    setIsProcessing(true);
    setPaymentStep("processing");

    try {
      // Mock payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate random payment failure (10% chance)
      if (Math.random() < 0.1) {
        setErrorMessage("결제가 실패했습니다. 다시 시도해주세요.");
        setPaymentStep("error");
        return;
      }

      const formData = new FormData();
      formData.append("action", "add");
      formData.append("userId", user.id);
      formData.append(
        "amount",
        (heartPackage.hearts + heartPackage.bonus).toString()
      );
      formData.append("type", "PURCHASE");
      formData.append(
        "reason",
        `하트 패키지 구매 (${heartPackage.hearts} + ${heartPackage.bonus} 보너스)`
      );
      formData.append("paymentMethod", selectedPaymentMethod);
      formData.append("paymentAmount", totalPrice.toString());

      const response = await fetch("/api/hearts", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Log payment transaction
        await logPaymentTransaction();
        setPaymentStep("success");
        setTimeout(() => {
          onPaymentSuccess();
          onClose();
          resetForm();
        }, 3000);
      } else {
        setErrorMessage(data.error || "결제 처리 중 오류가 발생했습니다.");
        setPaymentStep("error");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setErrorMessage("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
      setPaymentStep("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const logPaymentTransaction = async () => {
    try {
      const formData = new FormData();
      formData.append("action", "log_payment");
      formData.append("userId", user!.id);
      formData.append("paymentMethod", selectedPaymentMethod);
      formData.append("amount", totalPrice.toString());
      formData.append(
        "hearts",
        (heartPackage.hearts + heartPackage.bonus).toString()
      );
      formData.append("packageId", heartPackage.id);

      await fetch("/api/payment-history", {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.error("Error logging payment:", error);
    }
  };

  const resetForm = () => {
    setSelectedPaymentMethod("");
    setPaymentStep("method");
    setCardDetails({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
    });
    setPhoneNumber("");
    setBankAccount("");
    setErrorMessage("");
  };

  const renderPaymentMethodSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t("membership.payment_method")}
      </h3>

      <div className="space-y-2">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => setSelectedPaymentMethod(method.id)}
            className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
              selectedPaymentMethod === method.id
                ? "border-bugs-pink bg-pink-50"
                : "border-gray-200 hover:border-bugs-pink"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-bugs-pink">{method.icon}</div>
                <div>
                  <div className="font-medium text-gray-900">
                    {language === "ko" ? method.name : method.nameEn}
                  </div>
                  <div className="text-sm text-gray-600">
                    {language === "ko"
                      ? method.description
                      : method.descriptionEn}
                  </div>
                </div>
              </div>
              {method.fee && method.fee > 0 && (
                <div className="text-sm text-orange-600">
                  +₩{method.fee.toLocaleString()}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>총 결제금액</span>
          <span className="text-bugs-pink">₩{totalPrice.toLocaleString()}</span>
        </div>
      </div>

      <button
        onClick={() => setPaymentStep("details")}
        disabled={!selectedPaymentMethod}
        className="w-full mt-4 py-3 bg-bugs-pink text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-600 transition-colors"
      >
        다음 단계
      </button>
    </div>
  );

  const renderPaymentDetails = () => {
    const method = paymentMethods.find((m) => m.id === selectedPaymentMethod);

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <button
            onClick={() => setPaymentStep("method")}
            className="text-gray-600 hover:text-gray-900"
          >
            ← 뒤로
          </button>
          <h3 className="text-lg font-semibold text-gray-900">
            {language === "ko" ? method?.name : method?.nameEn} 정보 입력
          </h3>
        </div>

        {selectedPaymentMethod === "credit_card" && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="cardNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                카드번호
              </label>
              <input
                id="cardNumber"
                type="text"
                value={cardDetails.cardNumber}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, cardNumber: e.target.value })
                }
                placeholder="1234 5678 9012 3456"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bugs-pink"
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="expiryDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  유효기간
                </label>
                <input
                  id="expiryDate"
                  type="text"
                  value={cardDetails.expiryDate}
                  onChange={(e) =>
                    setCardDetails({
                      ...cardDetails,
                      expiryDate: e.target.value,
                    })
                  }
                  placeholder="MM/YY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bugs-pink"
                  maxLength={5}
                />
              </div>
              <div>
                <label
                  htmlFor="cvv"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  CVV
                </label>
                <input
                  id="cvv"
                  type="text"
                  value={cardDetails.cvv}
                  onChange={(e) =>
                    setCardDetails({ ...cardDetails, cvv: e.target.value })
                  }
                  placeholder="123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bugs-pink"
                  maxLength={4}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="cardholderName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                카드소유자명
              </label>
              <input
                id="cardholderName"
                type="text"
                value={cardDetails.cardholderName}
                onChange={(e) =>
                  setCardDetails({
                    ...cardDetails,
                    cardholderName: e.target.value,
                  })
                }
                placeholder="홍길동"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bugs-pink"
              />
            </div>
          </div>
        )}

        {selectedPaymentMethod === "phone_payment" && (
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              휴대폰 번호
            </label>
            <input
              id="phoneNumber"
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="010-1234-5678"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bugs-pink"
            />
          </div>
        )}

        {selectedPaymentMethod === "bank_transfer" && (
          <div>
            <label
              htmlFor="bankAccount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              계좌번호
            </label>
            <input
              id="bankAccount"
              type="text"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="123-456-789012"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bugs-pink"
            />
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-800">
              모든 결제 정보는 SSL로 암호화되어 안전하게 처리됩니다.
            </span>
          </div>
        </div>

        <button
          onClick={handlePaymentSubmit}
          disabled={isProcessing}
          className="w-full mt-6 py-3 bg-bugs-pink text-white rounded-lg font-medium disabled:opacity-50 hover:bg-pink-600 transition-colors"
        >
          {isProcessing
            ? "처리 중..."
            : `₩${totalPrice.toLocaleString()} 결제하기`}
        </button>
      </div>
    );
  };

  const renderProcessing = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bugs-pink mx-auto mb-4"></div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        결제 처리 중...
      </h3>
      <p className="text-gray-600">잠시만 기다려주세요.</p>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-8">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">결제 완료!</h3>
      <p className="text-gray-600 mb-4">
        {heartPackage.hearts + heartPackage.bonus} 하트가 지급되었습니다.
      </p>
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="text-sm text-green-800">
          결제 확인 메일이 발송되었습니다.
        </div>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="text-center py-8">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">결제 실패</h3>
      <p className="text-gray-600 mb-4">{errorMessage}</p>
      <div className="space-y-2">
        <button
          onClick={() => setPaymentStep("details")}
          className="w-full py-2 bg-bugs-pink text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          다시 시도
        </button>
        <button
          onClick={onClose}
          className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">하트 패키지 결제</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">
                {heartPackage.hearts} 하트 + {heartPackage.bonus} 보너스
              </div>
              <div className="text-sm text-gray-600">
                총 {heartPackage.hearts + heartPackage.bonus} 하트
              </div>
            </div>
            <div className="text-lg font-bold text-bugs-pink">
              ₩{heartPackage.price.toLocaleString()}
            </div>
          </div>
        </div>

        {paymentStep === "method" && renderPaymentMethodSelection()}
        {paymentStep === "details" && renderPaymentDetails()}
        {paymentStep === "processing" && renderProcessing()}
        {paymentStep === "success" && renderSuccess()}
        {paymentStep === "error" && renderError()}
      </div>
    </div>
  );
}
