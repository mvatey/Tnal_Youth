"use client";

import { useCallback, useEffect, useState } from "react";
import { Send, X } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  dismissTelegramBanner,
  isTelegramBannerDismissed,
} from "@/lib/telegramReminder";

/*
 * Shown at the top of the main activities list page to remind a member to
 * connect their Telegram so they get real-time updates about activities
 * (via the org's existing chatbot — see
 * authentication/telegram/TelegramLinkController on the backend).
 *
 * GET /api/telegram/connect-info returns { connected, deepLink }:
 *   - connected: true  -> nothing to do, this banner renders nothing.
 *   - connected: false -> deepLink is a https://t.me/<bot>?start=<token>
 *     link; clicking it opens the user's Telegram app/web client straight
 *     into a chat with the bot, which auto-sends "/start <token>" and the
 *     bot's own server then calls POST /api/telegram/link to complete the
 *     connection on this end.
 *
 * Once connected the banner is expected to disappear on its own next time
 * this component mounts (i.e. next page load) — there's no realtime push
 * telling the browser the instant linking succeeds, since that happens on
 * the bot's server, not here. A manual "already connected? refresh"
 * affordance isn't included because re-visiting a page that mounts this
 * banner already re-checks on load.
 *
 * Crossing the banner out (the X button) is remembered via
 * @/lib/telegramReminder (localStorage, keyed by user id) so it doesn't
 * keep reappearing every time this page is revisited during the same
 * login — but AuthContext#logout clears that key, so it comes back at the
 * next login, and it stops appearing for good only once the account is
 * actually connected.
 */
export default function TelegramConnectBanner() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(isTelegramBannerDismissed(user?.id));
  }, [user?.id]);

  const handleDismiss = () => {
    setHidden(true);
    dismissTelegramBanner(user?.id);
  };

  const loadConnectInfo = useCallback(async () => {
    try {
      const response = await fetch("/api/backend/telegram/connect-info", {
        cache: "no-store",
      });

      if (!response.ok) {
        setInfo(null);
        return;
      }

      const body = await response.json().catch(() => null);
      setInfo(body);
    } catch {
      // A failed lookup just means no banner shows — not worth surfacing.
      setInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConnectInfo();
  }, [loadConnectInfo]);

  if (loading || hidden || !info || info.connected || !info.deepLink) {
    return null;
  }

  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-warning/30 bg-warning-bg px-5 py-4 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
          <Send size={16} />
        </div>

        <div>
          <p className="text-sm font-semibold text-text-primary">
            {t("activityPage.telegramTitle")}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {t("activityPage.telegramDescription")}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
        <a
          href={info.deepLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg bg-warning px-4 text-xs font-semibold text-white transition hover:opacity-90"
        >
          <Send size={14} />
          {t("activityPage.connectTelegram")}
        </a>

        <button
          type="button"
          aria-label={t("memberPage.close")}
          onClick={handleDismiss}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary transition hover:bg-black/5"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
