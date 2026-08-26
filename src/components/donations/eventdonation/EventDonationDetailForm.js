"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DonationFilterSelect from "../monthlydonation/DonationFilterSelect";
import DonationSearchInput from "@/components/forms/searchBar";
import Table from "@/components/tables/table";
import EventDonationBranchTotals from "./EventDonationBranchTotals";
import DonationTotalsCard from "@/components/donations/DonationTotalsCard";
import SponsorPanel from "@/components/donations/sponsor/SponsorPanel";
import { Check, X } from "lucide-react";
import useCurrentMember from "@/hooks/useCurrentMember";
import { useBranch, useBranchChangeGuard } from "@/context/BranchContext";
import useUsdKhrExchangeRate from "@/lib/useUsdKhrExchangeRate";
import { downloadTableAsExcel } from "@/utils/downloadExcel";
import { RiDownloadCloud2Line } from "react-icons/ri";
import { useLanguage } from "@/context/LanguageContext";

async function fetchJson(url, options) {
  const response = await fetch(url, { cache: "no-store", ...options });
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    throw new Error(body?.message || `Request failed (${response.status})`);
  }
  return body?.data ?? body;
}


const PAYMENT_METHOD_LABELS = {
  CASH: "Cash",
  ABA: "ABA",
  WING: "Wing",
  BANK_TRANSFER: "Bank Transfer",
  ACLEDA: "ACLEDA",
};

function normalizePaymentMethodCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

function paymentMethodLabelFromCode(value) {
  const code = normalizePaymentMethodCode(value);
  return PAYMENT_METHOD_LABELS[code] || value || "Cash";
}

function toOptions(items, labelKeys) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    value: String(item.id ?? item.value),
    label: labelKeys.map((key) => item[key]).find(Boolean) || String(item.id ?? item.value),
    raw: item,
  }));
}

function mergeSavedDonations(memberItems, donations, selectedBranch) {
  const savedByMember = new Map();

  donations.forEach((donation) => {
    if (!donation.memberId || String(donation.branchId) !== String(selectedBranch)) return;
    const key = String(donation.memberId);
    const current = savedByMember.get(key);
    const currentTimestamp = Date.parse(current?.updatedAt || current?.createdAt || "") || 0;
    const candidateTimestamp = Date.parse(donation.updatedAt || donation.createdAt || "") || 0;
    if (current && candidateTimestamp < currentTimestamp) return;
    if (current && candidateTimestamp === currentTimestamp && Number(donation.id) < Number(current.id)) return;
    savedByMember.set(key, donation);
  });

  return memberItems.map((member) => {
    const saved = savedByMember.get(String(member.id));
    if (!saved) return member;
    return {
      ...member,
      donationId: saved.id,
      realAmount: String(Number(saved.amountKhr || 0)),
      dollarAmount: Number(saved.amountUsd || 0).toFixed(2),
      paymentMethodId: saved.paymentMethodId ?? member.paymentMethodId,
      paymentMethod: paymentMethodLabelFromCode(
        saved.paymentMethodCode || member.paymentMethod,
      ),
      paidAt: saved.paidAt,
      receiptFileId: saved.receiptFileId,
      paymentReference: saved.paymentReference,
      note: saved.note,
      expectedUpdatedAt: saved.updatedAt,
    };
  });
}

export default function EventDonationDetailForm({ initialQuery = {}, onCancel }) {
  const { t } = useLanguage();
  const exchangeRateKhrPerUsd = useUsdKhrExchangeRate();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { member: currentMember } = useCurrentMember();
  const {
    branches: accessibleBranches = [],
    selectedBranch: globalSelectedBranch = "all",
  } = useBranch();
  // Keep event-donation permissions aligned with the monthly-donation flow:
  // - real SECRETARY / BRANCH_LEADER accounts may add and edit money;
  // - every VIEWER account is read-only even when viewerScope resolves to
  //   SECRETARY / BRANCH_LEADER;
  // - Viewer Secretary / Viewer Branch Leader still keep the SAME branch
  //   scope as the role they are viewing as.
  const effectiveRole = String(
    currentMember?.effectiveRole || currentMember?.role || "",
  ).toLowerCase();
  const isViewer =
    Boolean(currentMember?.isViewer) ||
    String(currentMember?.role || "").toLowerCase() === "viewer";
  const canEdit =
    !isViewer && ["secretary", "branch_leader"].includes(effectiveRole);
  // Branch scope is based on the EFFECTIVE read role, not canEdit. This is
  // important for VIEWER + SECRETARY / BRANCH_LEADER: they must remain
  // locked to their branch even though the inputs and Save action are disabled.
  const isBranchScoped = ["secretary", "branch_leader"].includes(effectiveRole);
  // Same role set is always scoped to exactly one branch — the sidebar's
  // global dropdown — same as AddDonationForm.js (monthly/sponsor). This
  // form used to only take its branch from initialQuery/URL once at mount,
  // so a secretary who opened it and then switched branches in the sidebar
  // kept editing the previous branch's members with no indication anything
  // was stale.
  const effectiveBranchId = useMemo(() => {
    if (!isBranchScoped) return null;
    if (globalSelectedBranch && globalSelectedBranch !== "all") return String(globalSelectedBranch);
    if (accessibleBranches.length > 0) return String(accessibleBranches[0].id);
    return currentMember?.branchId ? String(currentMember.branchId) : null;
  }, [isBranchScoped, globalSelectedBranch, accessibleBranches, currentMember?.branchId]);
  const listPath = pathname?.startsWith("/admin/donation")
    ? "/admin/donation/eventdonation"
    : "/donation/eventdonation";
  const isDetailPage = pathname?.endsWith("/detail");
  const initialBranch = String(initialQuery.branch || searchParams.get("branch") || "all");
  const initialEvent = String(initialQuery.event || searchParams.get("event") || "all");

  const [selectedBranch, setSelectedBranch] = useState(initialBranch);
  const [selectedEvent, setSelectedEvent] = useState(initialEvent);
  // "members" = this branch's own per-member donation entry (the original
  // table below); "branches" = a read-only, cross-branch totals view for
  // the chosen activity — see EventDonationBranchTotals. Only meaningful
  // once both a branch and an activity are picked, same gate as the
  // members table itself.
  const [activeTab, setActiveTab] = useState("members");
  const [searchQuery, setSearchQuery] = useState("");
  const [branches, setBranches] = useState([]);
  const [activities, setActivities] = useState([]);
  const [members, setMembers] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [donationTypeId, setDonationTypeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  // The selected activity's real host branch (authoritative — fetched from
  // the activity itself, not just assumed equal to whatever selectedBranch
  // is currently filtered to). Drives both isBranchOrganizer below and the
  // "organizer" marker EventDonationBranchTotals shows in its own table.
  const [organizerBranchId, setOrganizerBranchId] = useState(null);
  // True as soon as the user has typed an amount that hasn't been saved
  // yet -- see the Table's onRowsChange below. Drives the branch-switch
  // confirmation guard: switching branches mid-entry with nothing typed
  // just follows the sidebar silently, same as before.
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);

  // Clears the whole in-progress entry -- selected activity, tab, search,
  // rows, dirty flag -- back to a fresh start. Called whenever the branch
  // actually changes (a previously selected activity almost certainly
  // doesn't belong to the new branch) and after a confirmed branch switch
  // (discarded or saved-then-switched) via the guard below.
  function resetProgressForBranchSwitch() {
    setSelectedEvent("all");
    setActiveTab("members");
    setSearchQuery("");
    setMembers([]);
    setHasUnsavedEdits(false);
  }

  const previousEffectiveBranchIdRef = useRef(effectiveBranchId);

  // Keep selectedBranch following the sidebar for a branch-scoped role —
  // mirrors AddDonationForm.js's same fix. Only resets the in-progress
  // activity/rows when the branch actually changes to a different one
  // (not on first resolve, which would otherwise wipe out an initialEvent
  // passed in from the URL before the user ever touched anything). A
  // switch that had unsaved edits never reaches here silently -- see
  // useBranchChangeGuard below, which intercepts it with a confirmation
  // dialog before the sidebar's selection (and therefore effectiveBranchId)
  // changes at all.
  useEffect(() => {
    const previous = previousEffectiveBranchIdRef.current;
    previousEffectiveBranchIdRef.current = effectiveBranchId;

    if (!isBranchScoped || !effectiveBranchId || previous === effectiveBranchId) {
      return;
    }

    setSelectedBranch(effectiveBranchId);

    if (previous != null) {
      resetProgressForBranchSwitch();
    }
  }, [isBranchScoped, effectiveBranchId]);

  useBranchChangeGuard({
    isDirty: () => isBranchScoped && hasUnsavedEdits,
    onSave: () => handleSave(members),
    onReset: resetProgressForBranchSwitch,
  });

  useEffect(() => {
    if (selectedEvent === "all") {
      setOrganizerBranchId(null);
      return undefined;
    }
    let cancelled = false;
    fetchJson(`/api/backend/activities/${encodeURIComponent(selectedEvent)}`)
      .then((activity) => {
        if (!cancelled) setOrganizerBranchId(activity?.branchId ?? null);
      })
      .catch(() => {
        if (!cancelled) setOrganizerBranchId(null);
      });
    return () => { cancelled = true; };
  }, [selectedEvent]);

  // "Branch organizer" = this account is a secretary/branch_leader with
  // access to the branch that actually hosts the selected activity —
  // mirrors the backend's own host-branch check (see
  // ActivityMediaServiceImpl#validateManagePermission). They (plus admin,
  // read-only — see isAdmin below) get the Sponsor tab; a co-hosting/invited
  // branch or a viewer does not.
  // This page is opened in the context of `selectedBranch`.  An account may
  // manage more than one branch, so checking whether the actor has access to
  // the organizer branch is not enough: while viewing an invited branch we
  // must treat that branch as an invited branch even if the same actor also
  // happens to manage the organizer.
  const isSelectedBranchOrganizer =
    organizerBranchId != null &&
    selectedBranch !== "all" &&
    String(selectedBranch) === String(organizerBranchId);

  // Admin sees the same Sponsor tab as the organizing branch's own staff so
  // they can see an activity's full donation picture (member + branch +
  // sponsor) in one place — SponsorPanel below is already hardcoded
  // readOnly regardless of who's viewing, so this never grants admin any
  // extra write capability.
  const isAdmin = !isViewer && effectiveRole === "admin";

  const isBranchOrganizer =
    (["secretary", "branch_leader"].includes(currentMember?.role) ||
      isAdmin) &&
    isSelectedBranchOrganizer;

  const isInvitedBranch =
    organizerBranchId != null &&
    selectedBranch !== "all" &&
    !isSelectedBranchOrganizer;

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchJson("/api/lookups/branches"),
      fetchJson("/api/backend/activities?page=0&size=100"),
      fetchJson("/api/lookups/payment-methods?activeOnly=true&includeMaterial=true"),
      fetchJson("/api/backend/donation-types?activeOnly=true"),
    ])
      .then(([branchItems, activityPage, methods, types]) => {
        if (cancelled) return;
        setBranches(toOptions(branchItems, ["nameKm", "labelKm", "name", "label"]));
        const activityItems = activityPage?.content ?? activityPage?.items ?? activityPage;
        setActivities(toOptions(activityItems, ["titleKm", "titleEn", "nameKm", "nameEn"]));
        setPaymentMethods(Array.isArray(methods) ? methods : []);
        const typeItems = Array.isArray(types) ? types : [];
        const eventType = typeItems.find((type) =>
          ["ACTIVITY_DONATION", "EVENT_DONATION", "ACTIVITY"].includes(String(type.code).toUpperCase()),
        ) || typeItems.find((type) => String(type.code).toUpperCase().includes("ACTIV"));
        setDonationTypeId(eventType?.id ?? null);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message || t("donationPage.loadDonationOptionsFailed"));
      });
    return () => { cancelled = true; };
  }, []);

  const eventOptions = useMemo(() => activities.filter((option) => {
    if (selectedBranch === "all") return true;

    // For an accepted invited/co-hosting activity, activity.branchId is the
    // ORGANIZER branch. The branch this Secretary is managing is returned
    // separately as managedInvitedBranchId, so include either relationship.
    const hostBranchId = option.raw?.branchId ?? option.raw?.branch?.id;
    const managedInvitedBranchId =
      option.raw?.managedInvitedBranchId ??
      option.raw?.managed_invited_branch_id ??
      null;

    return (
      String(hostBranchId ?? "") === String(selectedBranch) ||
      String(managedInvitedBranchId ?? "") === String(selectedBranch)
    );
  }), [activities, selectedBranch]);

  useEffect(() => {
    if (selectedBranch === "all" || selectedEvent === "all") {
      setMembers([]);
      return undefined;
    }
    let cancelled = false;
    const branchLabel = branches.find((option) => option.value === selectedBranch)?.label || "-";
    setLoading(true);
    setError("");
    Promise.all([
      fetchJson(`/api/backend/members?branchId=${encodeURIComponent(selectedBranch)}&page=0&size=100`),
      fetchJson(`/api/backend/donations?page=0&size=100&activityId=${encodeURIComponent(selectedEvent)}&branchId=${encodeURIComponent(selectedBranch)}`),
    ])
      .then(([page, donationPage]) => {
        if (cancelled) return;
        const items = page?.content ?? page?.items ?? page;
        const donationItems = donationPage?.items ?? donationPage?.content ?? donationPage;
        const memberItems = (Array.isArray(items) ? items : []).map((member) => ({
          id: member.id,
          memberId: member.id,
          branchId: member.branch?.id ?? member.branch_id ?? member.branchId ?? Number(selectedBranch),
          branch: member.branch?.label_km ?? member.branch?.labelKm ?? branchLabel,
          name:
            member.full_name_km ||
            member.fullNameKm ||
            member.nameKm ||
            member.full_name_en ||
            member.fullNameEn ||
            member.member_no ||
            member.memberNo ||
            `#${member.id}`,
          avatar: (() => {
            const profilePhoto = member.profile_photo || member.profilePhoto;
            return (
              profilePhoto?.url ||
              member.profile_photo_url ||
              member.profilePhotoUrl ||
              (profilePhoto?.id
                ? `/api/backend/files/${profilePhoto.id}/content`
                : "")
            );
          })(),
          gender: member.gender?.label_km || member.gender?.labelKm || member.gender?.code || member.gender || "-",
          dob: member.date_of_birth || member.dateOfBirth || "-",
          realAmount: "0",
          dollarAmount: "0.00",
          paymentMethod: paymentMethodLabelFromCode(
            paymentMethods[0]?.code || "Cash",
          ),
          paymentMethodId: paymentMethods[0]?.id,
          paymentReference: "",
        }));
        setMembers(mergeSavedDonations(
          memberItems,
          Array.isArray(donationItems) ? donationItems : [],
          selectedBranch,
        ));
      })
      .catch((loadError) => {
        if (!cancelled) {
          setMembers([]);
          setError(loadError.message || t("donationPage.loadBranchMembersFailed"));
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [branches, paymentMethods, selectedBranch, selectedEvent]);

  useEffect(() => {
    if (!showSaveAlert) return undefined;
    const timer = window.setTimeout(() => setShowSaveAlert(false), 3000);
    return () => window.clearTimeout(timer);
  }, [showSaveAlert]);

  // Invited branches work only with their own MEMBER income table.
  // They must never be switched to the cross-branch totals tab.
  // If branch/activity context changes, always fall back to members unless
  // the selected branch is the organizer and Sponsor is legitimately visible.
  useEffect(() => {
    if (isInvitedBranch && activeTab !== "members") {
      setActiveTab("members");
      return;
    }

    if (activeTab === "sponsor" && !isBranchOrganizer) {
      setActiveTab("members");
    }
  }, [activeTab, isBranchOrganizer, isInvitedBranch]);

  const handleSave = async (rows) => {
    if (!canEdit) { setError(t("donationPage.noEditPermission")); return false; }
    const completed = rows.filter((row) => Number(row.realAmount) > 0 || Number(row.dollarAmount) > 0);
    if (!donationTypeId) { setError(t("donationPage.missingEventDonationType")); return false; }
    if (selectedBranch === "all" || selectedEvent === "all") { setError(t("donationPage.selectBranchAndActivity")); return false; }
    if (completed.length === 0) { setError(t("donationPage.memberAmountRequired")); return false; }

    setSaving(true);
    setError("");
    try {
      const savedRows = await Promise.all(completed.map((row) => {
        // Resolve the CURRENT dropdown selection first, then fall back to
        // the loaded id. Table.js clears paymentMethodId whenever the user
        // changes Cash -> ABA/Wing/Bank Transfer, so an old Cash id can never
        // overwrite the new selection on Save.
        const selectedCode = normalizePaymentMethodCode(row.paymentMethod);
        const method =
          paymentMethods.find(
            (item) => normalizePaymentMethodCode(item.code) === selectedCode,
          ) ||
          paymentMethods.find(
            (item) => String(item.id) === String(row.paymentMethodId),
          ) ||
          paymentMethods[0];
        const payload = {
          donationTypeId: Number(donationTypeId),
          memberId: Number(row.memberId),
          activityId: Number(selectedEvent),
          branchId: Number(selectedBranch),
          donationPeriod: null,
          amountKhr: Number(row.realAmount || 0),
          amountUsd: Number(row.dollarAmount || 0),
          exchangeRateKhrPerUsd:
            Number(row.realAmount || 0) > 0
              ? (exchangeRateKhrPerUsd || null)
              : null,
          paymentMethodId: Number(method?.id),
          paidAt: row.paidAt || new Date().toISOString(),
          paymentReference: row.paymentReference || null,
          receiptFileId: row.receiptFileId || null,
          note: row.note || null,
          ...(row.donationId && row.expectedUpdatedAt
            ? { expectedUpdatedAt: row.expectedUpdatedAt }
            : {}),
        };
        return fetchJson(row.donationId
          ? `/api/backend/donations/${encodeURIComponent(row.donationId)}`
          : "/api/backend/donations", {
          method: row.donationId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }));
      // POST /api/donations returns a creation result (id, donationNo,
      // totalAmountUsd, createdAt), while PUT returns the full donation.
      // Pair responses with the submitted rows by position so a new row
      // receives its donationId and a second Save updates it instead of
      // creating a duplicate donation.
      const savedByMember = new Map(
        savedRows.map((saved, index) => [
          String(completed[index].memberId),
          saved,
        ]),
      );
      setMembers((current) => current.map((row) => {
        const saved = savedByMember.get(String(row.memberId));
        return saved ? {
          ...row,
          donationId: saved.id,
          paidAt: saved.paidAt,
          expectedUpdatedAt: saved.updatedAt,
        } : row;
      }));
      setSavedMessage(t("donationPage.savedMemberCount").replace("{count}", completed.length));
      setShowSaveAlert(true);
      setHasUnsavedEdits(false);
      if (!isDetailPage) window.setTimeout(() => router.push(listPath), 500);
      return true;
    } catch (saveError) {
      setError(saveError.message || t("donationPage.eventDonationSaveFailed"));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleBranchChange = (value) => {
    setSelectedBranch(value);
    setSelectedEvent("all");
    setMembers([]);
    setActiveTab("members");
    setHasUnsavedEdits(false);
  };

  const handleEventChange = (value) => {
    setSelectedEvent(value);
    setActiveTab("members");
  };

  const hasBranchAndEvent = selectedBranch !== "all" && selectedEvent !== "all";

  /*
   * Derived fresh from `members` every render — never an incrementally
   * accumulated running total — so editing a row (which replaces that
   * row's amount in place, see Table.js's updateRow/handleSaveRow) is
   * automatically reflected correctly with no separate "subtract the old
   * amount, add the new one" bookkeeping needed here.
   */
  const memberTotals = useMemo(() => {
    const riel = members.reduce((sum, row) => sum + (Number(row.realAmount) || 0), 0);
    const dollar = members.reduce((sum, row) => sum + (Number(row.dollarAmount) || 0), 0);
    return {
      riel,
      dollar,
      total: dollar + riel / (exchangeRateKhrPerUsd || 4000),
    };
  }, [exchangeRateKhrPerUsd, members]);

  const handleDownloadMembers = () => {
    const rows = members.map((member, index) => ({
      [t("donationPage.no")]: index + 1,
      [t("donationPage.member")]: member.name,
      [t("donationPage.gender")]: member.gender,
      [t("donationPage.amountKhrPlain")]: member.realAmount,
      [t("donationPage.amountUsdPlain")]: member.dollarAmount,
      [t("donationPage.paymentMethod")]: member.paymentMethod,
    }));

    const activityLabel = eventOptions.find(
      (option) => String(option.value) === String(selectedEvent),
    )?.label;
    const branchLabel = branches.find(
      (option) => String(option.value) === String(selectedBranch),
    )?.label;

    const fileName = [activityLabel, branchLabel, t("donationPage.member")]
      .filter(Boolean)
      .join("-");

    downloadTableAsExcel({ data: rows, fileName: fileName || t("donationPage.member") });
  };

  return (
    <>
      {showSaveAlert ? (
        <div className="pointer-events-none fixed left-1/2 top-6 z-[70] w-[min(92vw,560px)] -translate-x-1/2">
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-emerald-100 bg-bg-page-white px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check size={22} strokeWidth={2.5} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-text-primary">{t("donationPage.saveSuccessTitle")}</p>
              <p className="mt-0.5 text-xs text-text-secondary">{t("donationPage.saveSuccessDescription")}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowSaveAlert(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary transition hover:bg-bg-page-gray hover:text-text-primary"
              aria-label={t("memberPage.close")}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : null}
      <section className="min-h-[545px] min-w-0 rounded-md border border-border bg-bg-page-white p-4 sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-base font-semibold text-secondary">{t("donationPage.eventDonationRecordTitle")}</h1>
          {savedMessage ? <p className="text-sm font-medium text-success">{savedMessage}</p> : null}
        </div>
        {error ? <div className="mb-4 rounded-md border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">{error}</div> : null}
        <div className="mb-6 grid grid-cols-1 items-end gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-[360px]">
            <DonationFilterSelect label={t("donationPage.branch")} value={selectedBranch} onChange={handleBranchChange} options={branches} allLabel={t("donationPage.selectBranch")} className="w-full" required disabled={isDetailPage || isBranchScoped} />
            <DonationFilterSelect label={t("donationPage.activity")} value={selectedEvent} onChange={handleEventChange} options={eventOptions} allLabel={t("donationPage.selectActivity")} className="w-full" required disabled={isDetailPage} />
          </div>
          {activeTab === "members" ? (
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(220px,1fr)_auto]">
              <DonationSearchInput value={searchQuery} onChange={setSearchQuery} showLabel={false} />
              <button
                type="button"
                onClick={handleDownloadMembers}
                disabled={members.length === 0}
                className="inline-flex h-[34px] w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-secondary px-4 text-xs font-bold text-white shadow-sm transition hover:bg-secondary-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <RiDownloadCloud2Line size={15} />
                {t("common.download")}
              </button>
            </div>
          ) : null}
        </div>

        {/*
          Only meaningful once a branch + activity are both chosen — before
          that there is nothing to show either tab's table for. "សាខា"
          is read-only for every viewer (including this branch's own
          entry staff): it's a cross-branch summary, not something any
          single branch edits. "អ្នកឧបត្ថម្ភ" only appears for the branch
          that actually organizes the selected activity (see
          isBranchOrganizer above) — everyone else sees just these two.
        */}
        {hasBranchAndEvent && (
          <div className="mb-4 inline-flex w-fit shrink-0 rounded-lg border border-border bg-bg-page-gray p-1 text-xs font-medium">
            {(isInvitedBranch
              ? [{ key: "members", label: t("donationPage.member") }]
              : [
                  { key: "members", label: t("donationPage.member") },
                  { key: "branches", label: t("donationPage.branch") },
                  ...(isBranchOrganizer ? [{ key: "sponsor", label: t("memberPage.tabSponsor") }] : []),
                ]
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-md px-3 py-1.5 transition ${
                  activeTab === tab.key
                    ? "bg-secondary text-white"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {loading ? <div className="py-10 text-center text-sm text-text-secondary">{t("donationPage.loadingData")}</div> : null}
        {!loading && hasBranchAndEvent && activeTab === "members" ? (
          <Table
            members={members}
            selectedBranch={selectedBranch}
            searchQuery={searchQuery}
            // Match Monthly Donation: every member row is editable at the same
            // time and the whole table is saved with ONE bottom Save action.
            // Do not use rowEditMode here — that mode creates a pencil/save
            // action per row and makes event donations feel different from
            // monthly donations. VIEWER accounts still see the exact table,
            // but readOnly disables every amount/payment/receipt control.
            rowEditMode={false}
            readOnly={!canEdit}
            onRowsChange={(rows) => {
              setMembers(rows);
              setHasUnsavedEdits(true);
            }}
            onReset={() => {
              setMembers((rows) => rows.map((row) => ({ ...row, realAmount: "0", dollarAmount: "0" })));
              setHasUnsavedEdits(false);
            }}
            onCancel={onCancel || (() => router.push(listPath))}
            onSave={saving ? undefined : handleSave}
            onReceiptSave={(id, receipt) => setMembers((rows) => rows.map((row) => row.id === id ? { ...row, receipt } : row))}
            hideDob
          />
        ) : null}
        {!loading && hasBranchAndEvent && activeTab === "members" && members.length > 0 ? (
          <DonationTotalsCard
            title={t("donationPage.contributionTotal")}
            riel={memberTotals.riel}
            dollar={memberTotals.dollar}
            total={memberTotals.total}
          />
        ) : null}
        {hasBranchAndEvent && activeTab === "branches" && !isInvitedBranch ? (
          <EventDonationBranchTotals
            activityId={selectedEvent}
            organizerBranchId={organizerBranchId}
            selectedBranchId={selectedBranch}
          />
        ) : null}
        {hasBranchAndEvent && activeTab === "sponsor" && isBranchOrganizer ? (
          <SponsorPanel
            activityId={selectedEvent}
            selectedBranch={selectedBranch}
            branchScoped
            readOnly
          />
        ) : null}
      </section>
    </>
  );
}
