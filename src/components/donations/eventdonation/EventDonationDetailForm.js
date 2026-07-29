"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import DonationFilterSelect from "../monthlydonation/DonationFilterSelect";
import DonationSearchInput from "@/components/donations/DonationSearchInput";
import Table from "@/components/donations/DonationEntryTable";
import SaveSuccessAlert from "@/components/ui/feedback/SaveSuccessAlert";
import donationData from "@/data/donation/donationData.json";
import activities from "@/data/activityRecords.json";

const SAVED_EVENT_DONATION_ROWS_KEY =
  "tnal-youth:saved-event-donation-rows";
const EVENT_DONATION_SAVE_ALERT_KEY =
  "tnal-youth:event-donation-save-alert";
const { addDonationRows } = donationData;
const getSavedRowKey = (row) =>
  [row.branch, row.activityId, row.id].join("|");
function buildEventMembers() {
  return addDonationRows.flatMap((member) =>
    activities.map((activity) => ({
      ...member,
      activityId: activity.id,
      eventType:
        activity.type || "UNKNOWN",
      eventName:
        activity.name ||
        activity.title ||
        "មិនមានឈ្មោះកម្មវិធី",
      branch:
        activity.branchName ||
        activity.branch ||
        member.branch ||
        "-",

      realAmount:
        member.realAmount ?? "0",

      dollarAmount:
        member.dollarAmount ?? "0.00",

      paymentMethod:
        member.paymentMethod || "CASH",
    }))
  );
}

export default function EventDonationDetailForm({
  initialQuery = {},
  onCancel,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isDetailPage =
    pathname?.endsWith("/detail");

  const listPath =
    pathname?.startsWith("/admin/donation")
      ? "/admin/donation/eventdonation"
      : "/donation/eventdonation";

  const eventMembers = useMemo(
    buildEventMembers,
    []
  );

  const queryValues = useMemo(() => {
    return {
      branch:
        initialQuery.branch ||
        searchParams.get("branch") ||
        null,

      activityId:
        initialQuery.activityId ||
        initialQuery.id ||
        searchParams.get("activityId") ||
        searchParams.get("id") ||
        null,
    };
  }, [
    initialQuery.activityId,
    initialQuery.branch,
    initialQuery.id,
    searchParams,
  ]);

  const selectedActivity = useMemo(() => {
    return activities.find(
      (activity) =>
        String(activity.id) ===
        String(queryValues.activityId)
    );
  }, [queryValues.activityId]);

  const initialBranch =
    queryValues.branch ||
    selectedActivity?.branchName ||
    selectedActivity?.branch ||
    "all";

  const initialActivityId =
    queryValues.activityId
      ? String(queryValues.activityId)
      : "all";

  const [selectedBranch, setSelectedBranch] =
    useState(initialBranch);

  const [
    selectedActivityId,
    setSelectedActivityId,
  ] = useState(initialActivityId);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [savedMessage, setSavedMessage] =
    useState("");

  const [showSaveAlert, setShowSaveAlert] =
    useState(false);

  const [savedRows, setSavedRows] =
    useState({});

  const branches = useMemo(() => {
    return [
      ...new Set(
        eventMembers
          .map((row) => row.branch)
          .filter(Boolean)
      ),
    ];
  }, [eventMembers]);

  const activityOptions = useMemo(() => {
    return activities
      .filter((activity) => {
        if (selectedBranch === "all") {
          return true;
        }

        const activityBranch =
          activity.branchName ||
          activity.branch ||
          "";

        return activityBranch === selectedBranch;
      })
      .map((activity) => ({
        label:
          activity.name ||
          activity.title ||
          "មិនមានឈ្មោះកម្មវិធី",

        value: String(activity.id),
      }));
  }, [selectedBranch]);

  const members = useMemo(() => {
    return eventMembers
      .filter((row) => {
        const matchesActivity =
          selectedActivityId === "all" ||
          String(row.activityId) ===
            String(selectedActivityId);

        const matchesBranch =
          selectedBranch === "all" ||
          row.branch === selectedBranch;

        return (
          matchesActivity &&
          matchesBranch
        );
      })
      .map((row) => ({
        ...row,
        ...savedRows[getSavedRowKey(row)],
      }));
  }, [
    eventMembers,
    savedRows,
    selectedActivityId,
    selectedBranch,
  ]);

  useEffect(() => {
    const savedValue =
      window.localStorage.getItem(
        SAVED_EVENT_DONATION_ROWS_KEY
      );

    if (!savedValue) {
      return;
    }

    try {
      setSavedRows(JSON.parse(savedValue));
    } catch {
      setSavedRows({});
    }
  }, []);

  useEffect(() => {
    setSelectedBranch(initialBranch);
    setSelectedActivityId(
      initialActivityId
    );
  }, [
    initialActivityId,
    initialBranch,
  ]);

  useEffect(() => {
    if (!showSaveAlert) {
      return undefined;
    }

    const timeoutId =
      window.setTimeout(() => {
        setShowSaveAlert(false);
      }, 3000);

    return () =>
      window.clearTimeout(timeoutId);
  }, [showSaveAlert]);

  const handleBranchChange = (value) => {
    setSelectedBranch(value);
    setSelectedActivityId("all");
    setSavedMessage("");
  };

  const handleSave = (rows) => {
    const completed = rows.filter(
      (row) =>
        Number(row.realAmount) > 0 ||
        Number(row.dollarAmount) > 0
    );

    if (completed.length === 0) {
      setSavedMessage(
        "សូមបញ្ចូលចំនួនទឹកប្រាក់យ៉ាងហោចណាស់ម្នាក់"
      );
      return;
    }

    const nextRows = {
      ...savedRows,
    };

    rows.forEach((row) => {
      const key = getSavedRowKey(row);

      nextRows[key] = {
        ...nextRows[key],
        realAmount:
          row.realAmount ?? "0",
        dollarAmount:
          row.dollarAmount ?? "0",
        paymentMethod:
          row.paymentMethod || "CASH",
        receipt:
          row.receipt ??
          nextRows[key]?.receipt ??
          null,
      };
    });

    try {
      window.localStorage.setItem(
        SAVED_EVENT_DONATION_ROWS_KEY,
        JSON.stringify(nextRows)
      );

      window.localStorage.setItem(
        EVENT_DONATION_SAVE_ALERT_KEY,
        "true"
      );
    } catch {
      setSavedMessage(
        "មិនអាចរក្សាទុកទិន្នន័យបានទេ"
      );
      return;
    }

    setSavedRows(nextRows);
    router.push(listPath);
  };

  const handleReset = (rows) => {
    setSavedRows((currentRows) => {
      const nextRows = {
        ...currentRows,
      };

      rows.forEach((row) => {
        const key = getSavedRowKey(row);

        nextRows[key] = {
          ...nextRows[key],
          realAmount: "0",
          dollarAmount: "0",
          paymentMethod:
            row.paymentMethod || "CASH",
        };
      });

      try {
        window.localStorage.setItem(
          SAVED_EVENT_DONATION_ROWS_KEY,
          JSON.stringify(nextRows)
        );
      } catch {
        // Keep reset values in state.
      }

      return nextRows;
    });
  };

  const handleReceiptSave = (
    id,
    receipt
  ) => {
    const row = members.find(
      (member) =>
        String(member.id) ===
        String(id)
    );

    if (!row) {
      return;
    }

    setSavedRows((currentRows) => {
      const key = getSavedRowKey(row);

      const nextRows = {
        ...currentRows,

        [key]: {
          ...currentRows[key],
          receipt,
        },
      };

      try {
        window.localStorage.setItem(
          SAVED_EVENT_DONATION_ROWS_KEY,
          JSON.stringify(nextRows)
        );
      } catch {
        // Large receipt previews may exceed localStorage.
      }

      return nextRows;
    });

    setSavedMessage(
      "បានរក្សាទុកវិក្កយបត្រដោយជោគជ័យ"
    );
  };

  const hasRequiredFilters =
    selectedBranch !== "all" &&
    selectedActivityId !== "all";

  return (
    <>
      {showSaveAlert && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/25 pt-10"
          role="status"
          aria-live="polite"
        >
          <SaveSuccessAlert message="អបអរសាទរ វិភាគទានត្រូវបានបន្ថែមដោយជោគជ័យ" />
        </div>
      )}

      <section className="min-h-[545px] rounded-md border border-border bg-[#fbfbfd] p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-base font-semibold text-secondary">
            ការកត់ត្រាវិភាគទានក្នុងកម្មវិធី
          </h1>

          {savedMessage && (
            <p
              className="text-sm font-medium text-success"
              role="status"
            >
              {savedMessage}
            </p>
          )}
        </div>

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-6">
            <DonationFilterSelect
              label="សាខា"
              value={selectedBranch}
              onChange={handleBranchChange}
              options={branches}
              allLabel="ជ្រើសរើសសាខា"
              className="w-[158px]"
              required
              disabled={isDetailPage}
            />

            <DonationFilterSelect
              label="កម្មវិធី"
              value={selectedActivityId}
              onChange={setSelectedActivityId}
              options={activityOptions}
              allLabel="ជ្រើសរើសកម្មវិធី"
              className="w-[158px]"
              required
              disabled={isDetailPage}
            />
          </div>

          <DonationSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            showLabel={false}
          />
        </div>

        {hasRequiredFilters && (
          <Table
            members={members}
            selectedBranch={selectedBranch}
            searchQuery={searchQuery}
            onReset={handleReset}
            onCancel={
              onCancel ||
              (() => router.push(listPath))
            }
            onSave={handleSave}
            onReceiptSave={
              handleReceiptSave
            }
          />
        )}
      </section>
    </>
  );
}
