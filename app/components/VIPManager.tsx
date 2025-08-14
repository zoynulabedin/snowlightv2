import { useState, useEffect, useCallback } from "react";
import { Crown, Star, CheckCircle, XCircle, Calendar } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import { useAuth } from "~/contexts/AuthContext";

interface MembershipStatus {
  isVip: boolean;
  vipType: string | null;
  vipExpiry: string | null;
  heartsEarned: number;
}

interface VIPPlan {
  id: string;
  name: string;
  price: number;
  heartsBonus: number;
  features: string[];
  popular?: boolean;
}

export default function VIPManager() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus>({
    isVip: false,
    vipType: null,
    vipExpiry: null,
    heartsEarned: 0,
  });
  const [loading, setLoading] = useState(true);

  const vipPlans: VIPPlan[] = [
    {
      id: "BASIC",
      name: t("membership.basic"),
      price: 9900,
      heartsBonus: 1000,
      features: [
        "매일 추가 하트 100개",
        "광고 없는 음악 감상",
        "고화질 음악 스트리밍",
        "오프라인 다운로드 10곡",
      ],
    },
    {
      id: "PREMIUM",
      name: t("membership.premium"),
      price: 19900,
      heartsBonus: 2500,
      features: [
        "매일 추가 하트 200개",
        "광고 없는 음악 감상",
        "고화질 음악 스트리밍",
        "무제한 오프라인 다운로드",
        "독점 콘텐츠 접근",
        "우선 고객 지원",
      ],
      popular: true,
    },
    {
      id: "PLATINUM",
      name: t("membership.platinum"),
      price: 29900,
      heartsBonus: 5000,
      features: [
        "매일 추가 하트 300개",
        "모든 프리미엄 혜택",
        "독점 라이브 스트리밍",
        "아티스트 만남 이벤트 참여",
        "한정판 굿즈 우선 구매",
        "VIP 전용 커뮤니티 접근",
      ],
    },
  ];

  const fetchMembershipStatus = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/membership?userId=${user.id}`);
      const data = await response.json();

      if (data.error) {
        console.error("Error fetching membership:", data.error);
        return;
      }

      setMembershipStatus(data);
    } catch (error) {
      console.error("Error fetching membership data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchMembershipStatus();
    }
  }, [user, fetchMembershipStatus]);

  const subscribeToPlan = async (planId: string) => {
    if (!user) return;

    const plan = vipPlans.find((p) => p.id === planId);
    if (!plan) return;

    try {
      const formData = new FormData();
      formData.append("action", "subscribe");
      formData.append("userId", user.id);
      formData.append("planType", planId);

      const response = await fetch("/api/membership", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMembershipStatus(data.membership);
        alert(
          `${plan.name} 멤버십에 가입되었습니다! ${plan.heartsBonus} 하트가 지급되었습니다.`
        );
      } else {
        alert(data.error || "구독 실패");
      }
    } catch (error) {
      console.error("Error subscribing to plan:", error);
      alert("구독 실패");
    }
  };

  const cancelSubscription = async () => {
    if (!user) return;

    if (!confirm("정말로 VIP 멤버십을 취소하시겠습니까?")) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("action", "cancel");
      formData.append("userId", user.id);

      const response = await fetch("/api/membership", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMembershipStatus(data.membership);
        alert("VIP 멤버십이 취소되었습니다.");
      } else {
        alert(data.error || "취소 실패");
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      alert("취소 실패");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "BASIC":
        return <Star className="w-6 h-6 text-blue-500" />;
      case "PREMIUM":
        return <Crown className="w-6 h-6 text-purple-500" />;
      case "PLATINUM":
        return <Crown className="w-6 h-6 text-yellow-500" />;
      default:
        return <Star className="w-6 h-6 text-gray-500" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "BASIC":
        return "from-blue-500 to-blue-600";
      case "PREMIUM":
        return "from-purple-500 to-purple-600";
      case "PLATINUM":
        return "from-yellow-400 to-yellow-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-Snowlight-pink mx-auto"></div>
          <p className="mt-2 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Membership Status */}
      {membershipStatus.isVip ? (
        <div
          className={`bg-gradient-to-r ${getPlanColor(
            membershipStatus.vipType || ""
          )} text-white rounded-lg p-6`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getPlanIcon(membershipStatus.vipType || "")}
              <div>
                <h2 className="text-2xl font-bold">
                  {membershipStatus.vipType} 멤버십
                </h2>
                <p className="text-white/80">
                  만료일:{" "}
                  {membershipStatus.vipExpiry
                    ? formatDate(membershipStatus.vipExpiry)
                    : "알 수 없음"}
                </p>
                <p className="text-white/80">
                  멤버십으로 획득한 하트:{" "}
                  {membershipStatus.heartsEarned.toLocaleString()}개
                </p>
              </div>
            </div>
            <button
              onClick={cancelSubscription}
              className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              멤버십 취소
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 rounded-lg p-6 text-center">
          <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700">
            VIP 멤버십이 없습니다
          </h2>
          <p className="text-gray-600 mt-2">
            아래에서 멤버십 플랜을 선택해보세요!
          </p>
        </div>
      )}

      {/* VIP Plans */}
      {!membershipStatus.isVip && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            VIP 멤버십 플랜
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vipPlans.map((plan) => (
              <div
                key={plan.id}
                className={`border-2 rounded-lg p-6 relative border-gray-200 hover:border-Snowlight-pink ${
                  plan.popular ? "ring-2 ring-orange-400" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-orange-400 text-white text-sm px-3 py-1 rounded-full">
                      {t("membership.popular")}
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    {getPlanIcon(plan.id)}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h4>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    ₩{plan.price.toLocaleString()}
                  </div>
                  <div className="text-gray-600 mb-4">월 요금</div>
                  <div className="text-green-600 font-medium mb-6">
                    가입 즉시 {plan.heartsBonus.toLocaleString()} 하트 지급!
                  </div>

                  <ul className="space-y-2 mb-6 text-left">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => subscribeToPlan(plan.id)}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      plan.popular
                        ? "bg-orange-400 text-white hover:bg-orange-500"
                        : "bg-Snowlight-pink text-white hover:bg-pink-600"
                    }`}
                  >
                    {plan.name} 멤버십 시작하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Membership Benefits */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4">
          VIP 멤버십 혜택
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <Crown className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-medium">무제한 스트리밍</div>
              <div className="text-sm text-gray-600">광고 없는 음악 감상</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-medium">매일 하트 지급</div>
              <div className="text-sm text-gray-600">플랜별 추가 하트</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Star className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-medium">독점 콘텐츠</div>
              <div className="text-sm text-gray-600">VIP 전용 음악</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-medium">우선 지원</div>
              <div className="text-sm text-gray-600">빠른 고객 서비스</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
