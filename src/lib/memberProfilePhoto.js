export const DEFAULT_MEMBER_PROFILE_PHOTO = "/profiles/default-avatar.jpg";

export function getMemberProfilePhotoUrl(member) {
  if (!member) return DEFAULT_MEMBER_PROFILE_PHOTO;

  const profileFile = member.profile_photo || member.profilePhoto;
  const profilePhotoId =
    profileFile?.id || member.profilePhotoId || member.profile_photo_id;
  if (profilePhotoId) {
    return `/api/backend/files/${encodeURIComponent(profilePhotoId)}/content`;
  }

  const directUrl = member.profileImage || member.profile_image;
  if (
    typeof directUrl === "string" &&
    (directUrl.startsWith("/") || /^https?:\/\//i.test(directUrl))
  ) {
    return directUrl;
  }

  return DEFAULT_MEMBER_PROFILE_PHOTO;
}
