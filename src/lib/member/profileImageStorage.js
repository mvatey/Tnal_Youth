/* Notify mounted cards after the backend has saved a new profile photo. */
export function notifyProfileImageChange(memberId, imageData) {
  if (
    typeof window === "undefined" ||
    memberId === undefined ||
    memberId === null
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("tnal-profile-image-change", {
      detail: {
        memberId: String(memberId),
        imageData,
      },
    }),
  );
}
