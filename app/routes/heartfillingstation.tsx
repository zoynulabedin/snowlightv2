import { useState } from "react";
import {
  Heart,
  Gift,
  Star,
  Calendar,
  Clock,
  Zap,
  Trophy,
  Users,
} from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import Layout from "../components/Layout";

interface Mission {
  id: string;
  title: string;
  description: string;
  hearts: number;
  type: "daily" | "weekly" | "special";
  completed: boolean;
  progress?: number;
  maxProgress?: number;
  icon: React.ReactNode;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  type: "premium" | "download" | "exclusive" | "merchandise";
  image: string;
  available: boolean;
}

export default function HeartStationPage() {
  const { t } = useLanguage();
  const [userHearts, setUserHearts] = useState(1247);
  const [selectedTab, setSelectedTab] = useState<
    "missions" | "rewards" | "history"
  >("missions");

  const missions: Mission[] = [
    {
      id: "1",
      title: t("heartStation.missions.dailyLogin", "매일 로그인"),
      description: t(
        "heartStation.missions.dailyLoginDesc",
        "벅스에 매일 로그인하여 하트를 받으세요"
      ),
      hearts: 10,
      type: "daily",
      completed: true,
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: "2",
      title: t("heartStation.missions.listenSongs", "음악 듣기"),
      description: t(
        "heartStation.missions.listenSongsDesc",
        "오늘 5곡 이상 들으면 하트를 받을 수 있어요"
      ),
      hearts: 15,
      type: "daily",
      completed: false,
      progress: 3,
      maxProgress: 5,
      icon: <Heart className="w-5 h-5" />,
    },
    {
      id: "3",
      title: t("heartStation.missions.addFavorites", "좋아요 누르기"),
      description: t(
        "heartStation.missions.addFavoritesDesc",
        "3곡에 좋아요를 눌러주세요"
      ),
      hearts: 8,
      type: "daily",
      completed: false,
      progress: 1,
      maxProgress: 3,
      icon: <Star className="w-5 h-5" />,
    },
    {
      id: "4",
      title: t("heartStation.missions.shareMusic", "음악 공유하기"),
      description: t(
        "heartStation.missions.shareMusicDesc",
        "친구에게 음악을 공유해보세요"
      ),
      hearts: 20,
      type: "daily",
      completed: false,
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: "5",
      title: t("heartStation.missions.weeklyChallenge", "주간 챌린지"),
      description: t(
        "heartStation.missions.weeklyChallengeDesc",
        "이번 주에 50곡 이상 들어보세요"
      ),
      hearts: 100,
      type: "weekly",
      completed: false,
      progress: 23,
      maxProgress: 50,
      icon: <Trophy className="w-5 h-5" />,
    },
    {
      id: "6",
      title: t("heartStation.missions.specialEvent", "특별 이벤트"),
      description: t(
        "heartStation.missions.specialEventDesc",
        "신규 앨범 3개 이상 들어보세요"
      ),
      hearts: 200,
      type: "special",
      completed: false,
      progress: 1,
      maxProgress: 3,
      icon: <Gift className="w-5 h-5" />,
    },
  ];

  const rewards: Reward[] = [
    {
      id: "1",
      title: t("heartStation.rewards.premiumDay", "프리미엄 1일 이용권"),
      description: t(
        "heartStation.rewards.premiumDayDesc",
        "광고 없이 무제한 음악 감상"
      ),
      cost: 100,
      type: "premium",
      image: "/api/placeholder/200/150",
      available: true,
    },
    {
      id: "2",
      title: t("heartStation.rewards.downloads", "다운로드 5회"),
      description: t(
        "heartStation.rewards.downloadsDesc",
        "좋아하는 음악을 오프라인으로"
      ),
      cost: 50,
      type: "download",
      image: "/api/placeholder/200/150",
      available: true,
    },
    {
      id: "3",
      title: t("heartStation.rewards.exclusivePlaylist", "독점 플레이리스트"),
      description: t(
        "heartStation.rewards.exclusivePlaylistDesc",
        "큐레이터가 선별한 특별 플레이리스트"
      ),
      cost: 150,
      type: "exclusive",
      image: "/api/placeholder/200/150",
      available: true,
    },
    {
      id: "4",
      title: t("heartStation.rewards.merchandise", "벅스 굿즈"),
      description: t(
        "heartStation.rewards.merchandiseDesc",
        "한정판 벅스 에코백"
      ),
      cost: 500,
      type: "merchandise",
      image: "/api/placeholder/200/150",
      available: false,
    },
    {
      id: "5",
      title: t("heartStation.rewards.premiumWeek", "프리미엄 7일 이용권"),
      description: t(
        "heartStation.rewards.premiumWeekDesc",
        "일주일간 프리미엄 서비스 이용"
      ),
      cost: 600,
      type: "premium",
      image: "/api/placeholder/200/150",
      available: true,
    },
    {
      id: "6",
      title: t("heartStation.rewards.concertTicket", "콘서트 티켓 할인"),
      description: t(
        "heartStation.rewards.concertTicketDesc",
        "벅스 제휴 콘서트 20% 할인"
      ),
      cost: 300,
      type: "exclusive",
      image: "/api/placeholder/200/150",
      available: true,
    },
  ];

  const completeMission = (missionId: string) => {
    const mission = missions.find((m) => m.id === missionId);
    if (mission && !mission.completed) {
      setUserHearts((prev) => prev + mission.hearts);
      // In real app, this would update the mission status
    }
  };

  const redeemReward = (rewardId: string) => {
    const reward = rewards.find((r) => r.id === rewardId);
    if (reward && reward.available && userHearts >= reward.cost) {
      setUserHearts((prev) => prev - reward.cost);
      // In real app, this would process the reward redemption
      alert(`${reward.title} 교환이 완료되었습니다!`);
    }
  };

  const getMissionTypeColor = (type: Mission["type"]) => {
    switch (type) {
      case "daily":
        return "bg-blue-100 text-blue-800";
      case "weekly":
        return "bg-green-100 text-green-800";
      case "special":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRewardTypeColor = (type: Reward["type"]) => {
    switch (type) {
      case "premium":
        return "bg-yellow-100 text-yellow-800";
      case "download":
        return "bg-blue-100 text-blue-800";
      case "exclusive":
        return "bg-purple-100 text-purple-800";
      case "merchandise":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("heartStation.title", "하트 충전소")}
          </h1>
          <p className="text-gray-600">
            {t(
              "heartStation.description",
              "미션을 완료하고 하트를 모아 다양한 혜택을 받아보세요"
            )}
          </p>
        </div>

        {/* Heart Balance */}
        <div className="bg-gradient-to-r from-Snowlight-pink to-pink-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium mb-2">
                {t("heartStation.myHearts", "내 하트")}
              </h2>
              <div className="flex items-center space-x-2">
                <Heart className="w-6 h-6 fill-current" />
                <span className="text-3xl font-bold">
                  {userHearts.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-pink-100 text-sm mb-1">
                {t("heartStation.todayEarned", "오늘 획득")}
              </p>
              <p className="text-xl font-semibold">+25</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                {
                  id: "missions",
                  label: t("heartStation.tabs.missions", "미션"),
                  icon: Zap,
                },
                {
                  id: "rewards",
                  label: t("heartStation.tabs.rewards", "리워드"),
                  icon: Gift,
                },
                {
                  id: "history",
                  label: t("heartStation.tabs.history", "히스토리"),
                  icon: Clock,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      selectedTab === tab.id
                        ? "border-Snowlight-pink text-Snowlight-pink"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Missions Tab */}
            {selectedTab === "missions" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t("heartStation.availableMissions", "진행 가능한 미션")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {missions.map((mission) => (
                      <div
                        key={mission.id}
                        className={`border rounded-lg p-4 transition-all ${
                          mission.completed
                            ? "bg-green-50 border-green-200"
                            : "bg-white border-gray-200 hover:border-Snowlight-pink"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-lg ${
                                mission.completed
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {mission.icon}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {mission.title}
                              </h4>
                              <span
                                className={`inline-block px-2 py-1 text-xs rounded-full ${getMissionTypeColor(
                                  mission.type
                                )}`}
                              >
                                {mission.type === "daily"
                                  ? "데일리"
                                  : mission.type === "weekly"
                                  ? "위클리"
                                  : "스페셜"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-Snowlight-pink">
                            <Heart className="w-4 h-4 fill-current" />
                            <span className="font-semibold">
                              {mission.hearts}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">
                          {mission.description}
                        </p>

                        {mission.progress !== undefined &&
                          mission.maxProgress && (
                            <div className="mb-3">
                              <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>진행률</span>
                                <span>
                                  {mission.progress}/{mission.maxProgress}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-Snowlight-pink h-2 rounded-full transition-all"
                                  style={{
                                    width: `${
                                      (mission.progress / mission.maxProgress) *
                                      100
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                        <button
                          onClick={() => completeMission(mission.id)}
                          disabled={mission.completed}
                          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            mission.completed
                              ? "bg-green-100 text-green-700 cursor-not-allowed"
                              : "bg-Snowlight-pink text-white hover:bg-pink-600"
                          }`}
                        >
                          {mission.completed ? "완료됨" : "미션 수행"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Rewards Tab */}
            {selectedTab === "rewards" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t("heartStation.availableRewards", "교환 가능한 리워드")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rewards.map((reward) => (
                      <div
                        key={reward.id}
                        className={`border rounded-lg overflow-hidden transition-all ${
                          reward.available && userHearts >= reward.cost
                            ? "border-gray-200 hover:border-Snowlight-pink hover:shadow-md"
                            : "border-gray-200 opacity-75"
                        }`}
                      >
                        <img
                          src={reward.image}
                          alt={reward.title}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {reward.title}
                            </h4>
                            <span
                              className={`inline-block px-2 py-1 text-xs rounded-full ${getRewardTypeColor(
                                reward.type
                              )}`}
                            >
                              {reward.type}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-3">
                            {reward.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 text-Snowlight-pink">
                              <Heart className="w-4 h-4 fill-current" />
                              <span className="font-semibold">
                                {reward.cost}
                              </span>
                            </div>
                            <button
                              onClick={() => redeemReward(reward.id)}
                              disabled={
                                !reward.available || userHearts < reward.cost
                              }
                              className={`py-1 px-3 rounded text-xs font-medium transition-colors ${
                                reward.available && userHearts >= reward.cost
                                  ? "bg-Snowlight-pink text-white hover:bg-pink-600"
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              {!reward.available
                                ? "품절"
                                : userHearts < reward.cost
                                ? "하트 부족"
                                : "교환"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* History Tab */}
            {selectedTab === "history" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t("heartStation.recentActivity", "최근 활동")}
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        type: "earned",
                        amount: 10,
                        description: "매일 로그인 미션 완료",
                        time: "2시간 전",
                      },
                      {
                        type: "earned",
                        amount: 15,
                        description: "음악 듣기 미션 완료",
                        time: "5시간 전",
                      },
                      {
                        type: "spent",
                        amount: 50,
                        description: "다운로드 5회 교환",
                        time: "1일 전",
                      },
                      {
                        type: "earned",
                        amount: 8,
                        description: "좋아요 누르기 미션 완료",
                        time: "1일 전",
                      },
                      {
                        type: "earned",
                        amount: 20,
                        description: "음악 공유하기 미션 완료",
                        time: "2일 전",
                      },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              activity.type === "earned"
                                ? "bg-green-100"
                                : "bg-red-100"
                            }`}
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                activity.type === "earned"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`font-semibold ${
                            activity.type === "earned"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {activity.type === "earned" ? "+" : "-"}
                          {activity.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
