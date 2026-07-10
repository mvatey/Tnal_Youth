import IdCard from "@/components/card/idCard";
import CertificateCard from "@/components/card/certificate";
import DocumentPreviewCard from "@/components/card/DocumentPreviewCard";

export default function MyAccountDocumentsPage() {
  // Temporary static secretary data
const secretary = {
  id: 1,

  // Include these temporary aliases so the existing cards can find the photo.
  profileImage: "/rithy.jpg",
  profile_photo: "/rithy.jpg",
  avatar: "/rithy.jpg",
  image: "/rithy.jpg",
  photo: "/rithy.jpg",

  khmerName: "ផាន វិទ្ធី",
  name: "ផាន វិទ្ធី",

  englishName: "PHAN VITHEY",
  nameEnglish: "PHAN VITHEY",

  gender: "ប្រុស",
  role: "លេខាធិការ",
  position: "លេខាធិការ",

  phone: "012 666 766",
  email: "secretary@example.com",
  branch: "សាខា ភ្នំពេញ",

  birthDate: "4 មករា 1995",
  joinedDate: "25 មករា 2026",

  status: "សកម្ម",
  memberCode: "00009",
};

  return (
    <div className="flex flex-wrap justify-center gap-6 p-6">
      {/* Secretary Card */}
      <DocumentPreviewCard
        title="ប័ណ្ណបុគ្គលិក"
        data={[secretary]}
        filename="secretary-card.csv"
        previewClass="scale-[0.55]"
      >
        <IdCard user={secretary} />
      </DocumentPreviewCard>

      {/* Appointment Certificate */}
      <DocumentPreviewCard
        title="លិខិតតែងតាំង"
        data={[secretary]}
        filename="appointment-certificate.csv"
        previewClass="scale-[0.35]"
      >
        <CertificateCard user={secretary} />
      </DocumentPreviewCard>
    </div>
  );
}