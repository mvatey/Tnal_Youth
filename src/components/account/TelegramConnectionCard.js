"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Check, Send } from "lucide-react";

import PopupCard from "@/components/popup/PopupCard";
import { useLanguage } from "@/context/LanguageContext";

/*
 * Self-service Telegram connect/disconnect for a member's own account --
 * shown on myAcc/details/personal, which is only ever reached by a user
 * with a linked member record (a standalone ADMIN/VIEWER account is routed
 * to StandaloneAccountSettings instead by myAcc/layout.js), so no extra
 * role/memberId guard is needed here.
 *
 * GET /api/backend/telegram/connect-info -> { connected, deepLink }
 * DELETE /api/backend/telegram/link -> unlinks the current user's own
 * Telegram account (self-service only -- see TelegramLinkController).
 */
export default function TelegramConnectionCard() {
  const { t } = useLanguage();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlinking, setUnlinking] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const loadConnectInfo = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/backend/telegram/connect-info", {
        cache: "no-store",
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || t("memberPage.loadTelegramStatusFailed"));
      setInfo(body);
      setError("");
    } catch (loadError) {
      setError(loadError.message || t("memberPage.loadTelegramStatusFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadConnectInfo();
  }, [loadConnectInfo]);

  const handleUnlink = async () => {
    setUnlinking(true);
    setError("");
    try {
      const response = await fetch("/api/backend/telegram/link", {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || t("memberPage.disconnectTelegramFailed"));
      }
      setShowConfirm(false);
      await loadConnectInfo();
    } catch (unlinkError) {
      setError(unlinkError.message || t("memberPage.disconnectTelegramFailed"));
    } finally {
      setUnlinking(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-bg-page-white p-5">
      <h2 className="mb-1 flex items-center gap-2 text-base font-bold text-secondary">
        <Send size={18} />
        {t("memberPage.telegramConnectionTitle")}
      </h2>

      <p className="mb-4 text-sm text-text-secondary">
        {t("memberPage.telegramConnectionDescription")}
      </p>

      {loading ? (
        <p className="text-sm text-text-mute">{t("common.loading")}</p>
      ) : info?.connected ? (
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2 rounded-lg bg-success-bg px-3 py-2 text-sm font-medium text-success">
            <Check size={16} />
            {t("memberPage.telegramConnected")}
          </span>

          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="rounded-lg border border-error/30 px-4 py-2 text-sm font-semibold text-error transition hover:bg-error-bg"
          >
            {t("memberPage.disconnectTelegram")}
          </button>
        </div>
      ) : info?.deepLink ? (
        <a
          href={info.deepLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Send size={15} />
          {t("memberPage.connectTelegram")}
        </a>
      ) : (
        <p className="text-sm text-text-mute">{t("memberPage.telegramUnavailable")}</p>
      )}

      {error && <p className="mt-3 text-sm text-error">{error}</p>}

      {showConfirm && (
        <PopupCard size="sm" onClose={() => !unlinking && setShowConfirm(false)}>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-[34px] w-12 items-center justify-center rounded-full bg-error-bg text-error">
              <AlertTriangle size={22} />
            </div>

            <h2 className="mb-2 text-lg font-bold text-text-primary">
              {t("memberPage.disconnectTelegram")}
            </h2>

            <p className="mb-6 text-sm text-text-secondary">
              {t("memberPage.disconnectTelegramConfirmMessage")}
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleUnlink}
                disabled={unlinking}
                className="rounded-lg bg-error py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {unlinking ? t("common.loading") : t("memberPage.disconnectTelegram")}
              </button>

              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={unlinking}
                className="rounded-lg border border-border py-2.5 text-sm font-medium text-text-secondary transition hover:bg-bg-page-gray disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t("memberPage.cancel")}
              </button>
            </div>
          </div>
        </PopupCard>
      )}
    </div>
  );
}
