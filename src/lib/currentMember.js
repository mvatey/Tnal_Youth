import members from "@/data/members.json";

const CURRENT_MEMBER_ID = 3;

export function getCurrentMember() {
  return (
    members.find(
      (member) => String(member.id) === String(CURRENT_MEMBER_ID),
    ) || null
  );
}