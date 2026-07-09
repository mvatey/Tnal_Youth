export const PAGE_SIZE = 15;
export const DEFAULT_IMAGE = "/document.png";
export const MEMBER_IMAGE = "/certificate.jpg";

export const initialDocuments = Array.from({ length: 45 }, (_, i) => {
  const isMember = i % 2 !== 0;

  return {
    id: i + 1,
    title: isMember
      ? `បណ្ណសមាជិក ${i + 1}`
      : `របាយការណ៍ប្រចាំឆ្នាំ ${i + 1}`,
    memberName: "ម៉ៅ សំណាង",
    gender: "ប្រុស",
    branch: "សាខាភ្នំពេញ",
    date: isMember ? "Jan 6, 2022" : "2026-01-06",
    size: "100MB",
    type: "PDF",
    image: isMember ? MEMBER_IMAGE : DEFAULT_IMAGE,
    category: isMember ? "member" : "institution",
  };
});