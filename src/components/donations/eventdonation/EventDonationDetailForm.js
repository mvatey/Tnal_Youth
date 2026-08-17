"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DonationFilterSelect from "../monthlydonation/DonationFilterSelect";
import DonationSearchInput from "@/components/forms/searchBar";
import Table from "@/components/tables/table";
import EventDonationBranchTotals from "./EventDonationBranchTotals";
import DonationTotalsCard from "@/components/donations/DonationTotalsCard";
import { Check, X } from "lucide-react";
import useCurrentMember from "@/hooks/useCurrentMember";

// Matches the flat rate already used elsewhere in this form (see the
// exchangeRateKhrPerUsd sent in handleSave's payload below) and on the
// income/expense pages' own totals cards.
const KHR_PER_USD = 4000;

async function fetchJson(url, options) {
  const response = await fetch(url, { cache: "no-store", ...options });
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    throw new Error(body?.message || `Request failed (${response.status})`);
  }
  return body?.data ?? body;
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
      paymentMethod: saved.paymentMethodCode || member.paymentMethod,
      paidAt: saved.paidAt,
      receiptFileId: saved.receiptFileId,
      paymentReference: saved.paymentReference,
      note: saved.note,
      expectedUpdatedAt: saved.updatedAt,
    };
  });
}

export default function EventDonationDetailForm({ initialQuery = {}, onCancel }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { member: currentMember } = useCurrentMember();
  // Only entry staff (secretary / branch_leader) may record or edit event
  // donations here — admin/viewer are view-only, and members use their own
  // read-only "my donations" view instead of this staff-entry form.
  const canEdit = ["secretary", "branch_leader"].includes(currentMember?.role);
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
        if (!cancelled) setError(loadError.message || "Unable to load donation options.");
      });
    return () => { cancelled = true; };
  }, []);

  const eventOptions = useMemo(() => activities.filter((option) => {
    if (selectedBranch === "all") return true;
    const branchId = option.raw?.branchId ?? option.raw?.branch?.id;
    return branchId == null || String(branchId) === String(selectedBranch);
  }), [activities, selectedBranch]);

  useEffect(() => {
    if (selectedBranch === "all" || selectedEvent === "all") {
      setMembers([]);
      return undefined;
    }
    let cancelled = false;
    const branchLabel = branches.find((option) => option.value === selectedBranch)?.label || selectedBranch;
    setLoading(true);
    setError("");
    Promise.all([
      fetchJson(`/api/backend/members?branchId=${encodeURIComponent(selectedBranch)}&page=0&size=100`),
      fetchJson(`/api/backend/donations?page=0&size=100&activityId=${encodeURIComponent(selectedEvent)}`),
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
          paymentMethod: paymentMethods[0]?.code || "Cash",
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
          setError(loadError.message || "Unable to load members for this branch.");
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

  const handleSave = async (rows) => {
    if (!canEdit) { setError("អ្នកមិនមានសិទ្ធិកែប្រែវិភាគទាននេះទេ។"); return false; }
    const completed = rows.filter((row) => Number(row.realAmount) > 0 || Number(row.dollarAmount) > 0);
    if (!donationTypeId) { setError("Event donation type is missing in the backend."); return false; }
    if (selectedBranch === "all" || selectedEvent === "all") { setError("Please choose a branch and activity."); return false; }
    if (completed.length === 0) { setError("Please enter an amount for this member."); return false; }

    setSaving(true);
    setError("");
    try {
      const savedRows = await Promise.all(completed.map((row) => {
        const method = paymentMethods.find((item) =>
          String(item.id) === String(row.paymentMethodId) || item.code === row.paymentMethod,
        ) || paymentMethods[0];
        const payload = {
          donationTypeId: Number(donationTypeId),
          memberId: Number(row.memberId),
          activityId: Number(selectedEvent),
          branchId: Number(selectedBranch),
          donationPeriod: null,
          amountKhr: Number(row.realAmount || 0),
          amountUsd: Number(row.dollarAmount || 0),
          exchangeRateKhrPerUsd: Number(row.realAmount || 0) > 0 ? 4000 : null,
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
      const savedByMember = new Map(savedRows.map((saved) => [String(saved.memberId), saved]));
      setMembers((current) => current.map((row) => {
        const saved = savedByMember.get(String(row.memberId));
        return saved ? {
          ...row,
          donationId: saved.id,
          paidAt: saved.paidAt,
          expectedUpdatedAt: saved.updatedAt,
        } : row;
      }));
      setSavedMessage(`បានរក្សាទុកវិភាគទាន ${completed.length} នាក់`);
      setShowSaveAlert(true);
      if (!isDetailPage) window.setTimeout(() => router.push(listPath), 500);
      return true;
    } catch (saveError) {
      setError(saveError.message || "Unable to save event donations.");
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
    return { riel, dollar, total: dollar + riel / KHR_PER_USD };
  }, [members]);

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
              <p className="font-semibold text-text-primary">បានរក្សាទុកដោយជោគជ័យ</p>
              <p className="mt-0.5 text-xs text-text-secondary">ទិន្នន័យវិភាគទានរបស់សមាជិកត្រូវបានធ្វើបច្ចុប្បន្នភាព។</p>
            </div>
            <button
              type="button"
              onClick={() => setShowSaveAlert(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary transition hover:bg-bg-page-gray hover:text-text-primary"
              aria-label="Close notification"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : null}
      <section className="min-h-[545px] rounded-md border border-border bg-bg-page-white p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-base font-semibold text-secondary">ការកត់ត្រាវិភាគទានក្នុងកម្មវិធី</h1>
          {savedMessage ? <p className="text-sm font-medium text-success">{savedMessage}</p> : null}
        </div>
        {error ? <div className="mb-4 rounded-md border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">{error}</div> : null}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-6">
            <DonationFilterSelect label="សាខា" value={selectedBranch} onChange={handleBranchChange} options={branches} allLabel="ជ្រើសរើសសាខា" className="w-[158px]" required disabled={isDetailPage} />
            <DonationFilterSelect label="កម្មវិធី" value={selectedEvent} onChange={handleEventChange} options={eventOptions} allLabel="ជ្រើសរើសកម្មវិធី" className="w-[158px]" required disabled={isDetailPage} />
          </div>
          {activeTab === "members" ? (
            <DonationSearchInput value={searchQuery} onChange={setSearchQuery} showLabel={false} />
          ) : null}
        </div>

        {/*
          Only meaningful once a branch + activity are both chosen — before
          that there is nothing to show either tab's table for. "សាខា"
          is read-only for every viewer (including this branch's own
          entry staff): it's a cross-branch summary, not something any
          single branch edits.
        */}
        {hasBranchAndEvent && (
          <div className="mb-4 inline-flex w-fit shrink-0 rounded-lg border border-border bg-bg-page-gray p-1 text-xs font-medium">
            {[
              { key: "members", label: "សមាជិក" },
              { key: "branches", label: "សាខា" },
            ].map((tab) => (
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

        {loading ? <div className="py-10 text-center text-sm text-text-secondary">កំពុងទាញទិន្នន័យសមាជិក...</div> : null}
        {!loading && hasBranchAndEvent && activeTab === "members" ? (
          <Table
            members={members}
            selectedBranch={selectedBranch}
            searchQuery={searchQuery}
            rowEditMode={isDetailPage}
            readOnly={!canEdit}
            onRowsChange={setMembers}
            onReset={() => setMembers((rows) => rows.map((row) => ({ ...row, realAmount: "0", dollarAmount: "0" })))}
            onCancel={onCancel || (() => router.push(listPath))}
            onSave={saving ? undefined : handleSave}
            onReceiptSave={(id, receipt) => setMembers((rows) => rows.map((row) => row.id === id ? { ...row, receipt } : row))}
          />
        ) : null}
        {!loading && hasBranchAndEvent && activeTab === "members" && members.length > 0 ? (
          <DonationTotalsCard
            title="សរុបវិភាគទាន"
            riel={memberTotals.riel}
            dollar={memberTotals.dollar}
            total={memberTotals.total}
          />
        ) : null}
        {hasBranchAndEvent && activeTab === "branches" ? (
          <EventDonationBranchTotals activityId={selectedEvent} />
        ) : null}
      </section>
    </>
  );
}
