import { useState } from "react";
import { Crown, Heart } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import { useAuth } from "~/contexts/AuthContext";
import Layout from "~/components/Layout";
import HeartManager from "~/components/HeartManager";
import VIPManager from "~/components/VIPManager";

export default function MembershipPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"membership" | "hearts">(
    "membership"
  );

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t("membership.login_required")}
            </h2>
            <p className="text-gray-600 mb-6">
              {t("membership.login_required_desc")}
            </p>
            <a
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-bugs-pink text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              {t("auth.login")}
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("membership.title")}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("membership.subtitle")}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setActiveTab("membership")}
              className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === "membership"
                  ? "bg-white text-bugs-pink shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Crown className="w-5 h-5" />
              <span>{t("membership.vip_membership")}</span>
            </button>
            <button
              onClick={() => setActiveTab("hearts")}
              className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === "hearts"
                  ? "bg-white text-bugs-pink shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Heart className="w-5 h-5" />
              <span>{t("credits.hearts_management")}</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === "membership" && <VIPManager />}
          {activeTab === "hearts" && <HeartManager />}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {t("membership.faq")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("membership.faq_cancellation")}
              </h3>
              <p className="text-gray-600">
                {t("membership.faq_cancellation_answer")}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("membership.faq_hearts_usage")}
              </h3>
              <p className="text-gray-600">
                {t("membership.faq_hearts_usage_answer")}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("membership.faq_plan_change")}
              </h3>
              <p className="text-gray-600">
                {t("membership.faq_plan_change_answer")}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("membership.faq_refund")}
              </h3>
              <p className="text-gray-600">
                {t("membership.faq_refund_answer")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
