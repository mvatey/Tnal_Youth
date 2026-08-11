"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DonationFilterSelect from "../monthlydonation/DonationFilterSelect";
import DonationSearchInput from "@/components/forms/searchBar";
import Table from "@/components/tables/table";
import SaveAlert from "@/components/forms/savealert";

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
    const current = savedByMember.get(key) || {
      amountKhr: 0,
      amountUsd: 0,
      paymentMethodId: null,
      paymentMethodCode: "",
    };
    current.amountKhr += Number(donation.amountKhr || 0);
    current.amountUsd += Number(donation.amountUsd || 0);
    current.paymentMethodId = current.paymentMethodId ?? donation.paymentMethodId;
    current.paymentMethodCode = current.paymentMethodCode || donation.paymentMethodCode || "";
    savedByMember.set(key, current);
  });

  return memberItems.map((member) => {
    const saved = savedByMember.get(String(member.id));
    if (!saved) return member;
    return {
      ...member,
      realAmount: String(saved.amountKhr),
      dollarAmount: saved.amountUsd.toFixed(2),
      paymentMethodId: saved.paymentMethodId ?? member.paymentMethodId,
      paymentMethod: saved.paymentMethodCode || member.paymentMethod,
    };
  });
}

export default function EventDonationDetailForm({ initialQuery = {}, onCancel }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const listPath = pathname?.startsWith("/admin/donation")
    ? "/admin/donation/eventdonation"
    : "/donation/eventdonation";
  const isDetailPage = pathname?.endsWith("/detail");
  const initialBranch = String(initialQuery.branch || searchParams.get("branch") || "all");
  const initialEvent = String(initialQuery.event || searchParams.get("event") || "all");

  const [selectedBranch, setSelectedBranch] = useState(initialBranch);
  const [selectedEvent, setSelectedEvent] = useState(initialEvent);
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
      fetchJson("/api/backend/payment-methods?activeOnly=true"),
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
          avatar:
            member.profile_photo?.url ||
            member.profilePhoto?.url ||
            (member.profile_photo?.id
              ? `/api/backend/files/${member.profile_photo.id}/content`
              : member.profilePhoto?.id
                ? `/api/backend/files/${member.profilePhoto.id}/content`
                : ""),
          gender: member.gender?.label_km || member.gender?.labelKm || member.gender?.code || member.gender || "-",
          dob: member.date_of_birth || member.dateOfBirth || "-",
          realAmount: "0",
          dollarAmount: "0.00",
          paymentMethod: paymentMethods[0]?.code || "Cash",
          paymentMethodId: paymentMethods[0]?.id,
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
    const completed = rows.filter((row) => Number(row.realAmount) > 0 || Number(row.dollarAmount) > 0);
    if (!donationTypeId) return setError("Event donation type is missing in the backend.");
    if (selectedBranch === "all" || selectedEvent === "all") return setError("Please choose a branch and activity.");
    if (completed.length === 0) return setError("Please enter an amount for at least one member.");

    setSaving(true);
    setError("");
    try {
      await Promise.all(completed.map((row) => {
        const method = paymentMethods.find((item) =>
          String(item.id) === String(row.paymentMethodId) || item.code === row.paymentMethod,
        ) || paymentMethods[0];
        return fetchJson("/api/backend/donations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            donationTypeId: Number(donationTypeId),
            memberId: Number(row.memberId),
            activityId: Number(selectedEvent),
            branchId: Number(selectedBranch),
            amountKhr: Number(row.realAmount || 0),
            amountUsd: Number(row.dollarAmount || 0),
            exchangeRateKhrPerUsd: Number(row.realAmount || 0) > 0 ? 4000 : null,
            paymentMethodId: Number(method?.id),
            paidAt: new Date().toISOString(),
            receiptFileId: null,
          }),
        });
      }));
      setSavedMessage(`បានរក្សាទុកវិភាគទាន ${completed.length} នាក់`);
      setShowSaveAlert(true);
      window.setTimeout(() => router.push(listPath), 500);
    } catch (saveError) {
      setError(saveError.message || "Unable to save event donations.");
    } finally {
      setSaving(false);
    }
  };

  const handleBranchChange = (value) => {
    setSelectedBranch(value);
    setSelectedEvent("all");
    setMembers([]);
  };

  return (
    <>
      {showSaveAlert && <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/25 pt-10"><SaveAlert message="បានបន្ថែមវិភាគទានដោយជោគជ័យ" /></div>}
      <section className="min-h-[545px] rounded-md border border-border bg-[#fbfbfd] p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-base font-semibold text-secondary">ការកត់ត្រាវិភាគទានក្នុងកម្មវិធី</h1>
          {savedMessage ? <p className="text-sm font-medium text-success">{savedMessage}</p> : null}
        </div>
        {error ? <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-6">
            <DonationFilterSelect label="សាខា" value={selectedBranch} onChange={handleBranchChange} options={branches} allLabel="ជ្រើសរើសសាខា" className="w-[158px]" required disabled={isDetailPage} />
            <DonationFilterSelect label="កម្មវិធី" value={selectedEvent} onChange={setSelectedEvent} options={eventOptions} allLabel="ជ្រើសរើសកម្មវិធី" className="w-[158px]" required disabled={isDetailPage} />
          </div>
          <DonationSearchInput value={searchQuery} onChange={setSearchQuery} showLabel={false} />
        </div>
        {loading ? <div className="py-10 text-center text-sm text-text-secondary">កំពុងទាញទិន្នន័យសមាជិក...</div> : null}
        {!loading && selectedBranch !== "all" && selectedEvent !== "all" ? (
          <Table members={members} selectedBranch={selectedBranch} searchQuery={searchQuery} onReset={() => setMembers((rows) => rows.map((row) => ({ ...row, realAmount: "0", dollarAmount: "0" })))} onCancel={onCancel || (() => router.push(listPath))} onSave={saving ? undefined : handleSave} onReceiptSave={(id, receipt) => setMembers((rows) => rows.map((row) => row.id === id ? { ...row, receipt } : row))} />
        ) : null}
      </section>
    </>
  );
}
