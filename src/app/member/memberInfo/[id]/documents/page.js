"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download, Minus } from "lucide-react";

import IdCard from "@/components/card/idCard";
import CertificateCard from "@/components/card/certificate";
import DocumentPreviewCard from "@/components/card/DocumentPreviewCard";
import { getMemberProfilePhotoUrl } from "@/lib/memberProfilePhoto";
import LetterOfAppointment from "@/components/card/LetterOfAppointment";

export default function DocumentPage() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [memberResponse, branchesResponse, documentsResponse] =
        await Promise.all([
          fetch(`/api/members/${encodeURIComponent(id)}`, { cache: "no-store" }),
          fetch("/api/lookups/branches", { cache: "no-store" }),
          fetch("/api/backend/documents", { cache: "no-store" }),
        ]);
      const failed = [memberResponse, branchesResponse, documentsResponse].find(
        (response) => !response.ok,
      );

      if (failed) {
        const problem = await failed.json().catch(() => ({}));
        throw new Error(problem.message || "Unable to load member documents.");
      }

      const [memberData, branches, allDocuments] = await Promise.all([
        memberResponse.json(),
        branchesResponse.json(),
        documentsResponse.json(),
      ]);
      const branch = branches.find(
        (item) => String(item.value ?? item.id) === String(memberData.branch_id),
      );

      setMember({
        ...memberData,
        name_kh: memberData.full_name_km,
        name_en: memberData.full_name_en,
        date_of_birth: memberData.date_of_birth,
        branch: branch?.labelKm || branch?.labelEn || branch?.code || "-",
        status: memberData.status?.code || "ACTIVE",
        nationality:
          memberData.nationality?.label_km || memberData.nationality?.label_en || "-",
        ethnicity:
          memberData.ethnicity?.label_km || memberData.ethnicity?.label_en || "-",
        profile_photo: getMemberProfilePhotoUrl(memberData),
      });
      setDocuments(
        (Array.isArray(allDocuments) ? allDocuments : []).filter(
          (document) => String(document.member?.id) === String(id),
        ),
      );
    } catch (loadError) {
      setMember(null);
      setDocuments([]);
      setError(loadError.message || "Unable to load member documents.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  async function deleteDocument(documentId) {
    if (!window.confirm("តើអ្នកពិតជាចង់លុបឯកសារនេះមែនទេ?")) return;

    const response = await fetch(`/api/backend/documents/${encodeURIComponent(documentId)}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const problem = await response.json().catch(() => ({}));
      setError(problem.message || "Unable to delete the document.");
      return;
    }
    setDocuments((previous) => previous.filter((document) => document.id !== documentId));
  }

  if (loading) {
    return <div className="flex min-h-[300px] items-center justify-center text-sm text-gray-500">កំពុងទាញយកឯកសារ...</div>;
  }

  if (!member) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
        <p>{error || "រកមិនឃើញព័ត៌មានសមាជិក"}</p>
        <button type="button" onClick={loadDocuments} className="mt-3 font-semibold underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-2 2xl:grid-cols-3">
        <DocumentPreviewCard title="ប័ណ្ណសម្គាល់សមាជិក" actionType="print" printText="បោះពុម្ព" previewClass="scale-[0.55]">
          <IdCard user={member} templatePreview="" />
        </DocumentPreviewCard>

        <DocumentPreviewCard title="លិខិតតែងតាំង" actionType="download" downloadText="ទាញយក" filename={`letter-of-appointment-${member.id}.pdf`} orientation="landscape" previewClass="scale-[0.35]">
          <LetterOfAppointment user={member} />
        </DocumentPreviewCard>

        <DocumentPreviewCard title="បណ្ណសរសើរ" actionType="download" downloadText="ទាញយក" filename={`certificate-${member.id}.pdf`} orientation="landscape" previewClass="scale-[0.35]">
          <CertificateCard recipientType="member" member={member} templatePreview="" />
        </DocumentPreviewCard>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-primary">ឯកសារដែលបានផ្ទុកឡើង</h2>

        {documents.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">មិនទាន់មានឯកសារសម្រាប់សមាជិកនេះទេ។</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {documents.map((document) => (
              <article key={document.id} className="relative rounded-xl border border-gray-200 p-4">
                <button type="button" onClick={() => deleteDocument(document.id)} className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600" aria-label="លុបឯកសារ">
                  <Minus size={16} strokeWidth={3} />
                </button>
                <h3 className="pr-10 font-semibold text-text-primary">{document.title}</h3>
                <p className="mt-1 text-xs text-gray-500">{document.type?.label_km || document.type?.label_en || document.type?.code || "ឯកសារ"}</p>
                {document.description && <p className="mt-3 line-clamp-2 text-sm text-gray-600">{document.description}</p>}
                {document.file?.id && (
                  <a href={`/api/backend/files/${encodeURIComponent(document.file.id)}/content`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white">
                    <Download size={16} /> ទាញយក
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
